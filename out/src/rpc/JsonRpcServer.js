"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const http = require("http");
const HttpStatusCode = require("http-status-codes");
const BvspConstants_1 = require("../BvspConstants");
const Override_1 = require("../common/annotations/Override");
const DisposableBase_1 = require("../DisposableBase");
const JsonRpc_1 = require("./JsonRpc");
const JsonRpcErrorCodes_1 = require("./JsonRpcErrorCodes");
const JsonRpcHelper_1 = require("./JsonRpcHelper");
const ServerHttpContext_1 = require("./ServerHttpContext");
const ServerRpcContext_1 = require("./ServerRpcContext");
class JsonRpcServer extends DisposableBase_1.default {
    constructor() {
        super();
        this._methodHandlers = new Map();
        this._server = null;
        this._server = http.createServer(this.__requestHandler.bind(this));
        this.registerMethodHandlers();
    }
    start(port) {
        if (port === undefined) {
            port = 0;
        }
        else {
            port = port | 0;
        }
        const ipv4Localhost = "127.0.0.1";
        this._server.listen(port, ipv4Localhost, this.__serverError.bind(this));
    }
    stop() {
        this._server.close();
    }
    get endPoint() {
        return this._server.address();
    }
    get isRunning() {
        return this._server.listening;
    }
    disposeInternal() {
        if (this.isRunning) {
            this.stop();
        }
        this._methodHandlers.clear();
    }
    addMethodHandler(method, handler) {
        this._methodHandlers.set(method, handler);
        return this;
    }
    removeMethodHandler(method) {
        this._methodHandlers.delete(method);
        return this;
    }
    registerMethodHandlers() {
    }
    __requestHandler(request, response) {
        const context = new ServerHttpContext_1.default(request, response);
        validateHeaders(context).then(validationResult => {
            if (!validationResult.successful) {
                if (JsonRpc_1.default.debug) {
                    console.debug(`RPC failed. HTTP Status: ${validationResult.httpCode} RPC Err: ${validationResult.rpcErrorCode} Message: ${validationResult.rpcErrorMessage}`);
                }
                context.rpcError(validationResult.httpCode, validationResult.rpcErrorCode, validationResult.rpcErrorMessage);
                return;
            }
            assert.notEqual(validationResult.requestObject, null);
            dispatch(context, validationResult.requestObject, this._methodHandlers, this.__defaultMethodHandler.bind(this));
        }, err => {
            if (err !== undefined) {
                console.error(err);
            }
        });
        function validateHeaders(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = {
                    successful: false,
                    httpCode: HttpStatusCode.BAD_REQUEST,
                    rpcErrorCode: JsonRpcErrorCodes_1.JsonRpcErrorCodes.UnknownErrorCode,
                    rpcErrorMessage: "Unknown error",
                    requestObject: null
                };
                if (context.request.method === undefined) {
                    result.httpCode = HttpStatusCode.BAD_REQUEST;
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.InvalidRequest;
                    result.rpcErrorMessage = "Missing request method.";
                    return result;
                }
                if (context.request.method.toLowerCase() !== "post") {
                    result.httpCode = HttpStatusCode.METHOD_NOT_ALLOWED;
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.InvalidRequest;
                    result.rpcErrorMessage = "Invalid request method; expect POST.";
                    return result;
                }
                const headers = context.request.headers;
                if (headers["content-length"] === undefined) {
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.InvalidRequest;
                    result.rpcErrorMessage = "Content-Length header is missing.";
                    return result;
                }
                // TODO: More security concerns...
                const contentLengthValue = Number.parseInt(headers["content-length"]);
                if (contentLengthValue <= 0) {
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.InvalidRequest;
                    result.rpcErrorMessage = "Invalid content length.";
                    return result;
                }
                const contentTypeValue = headers["content-type"];
                if (contentTypeValue === undefined) {
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.InvalidRequest;
                    result.rpcErrorMessage = "Content-Type header is missing.";
                    return result;
                }
                if (contentTypeValue !== BvspConstants_1.BvspConstants.contentType) {
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.InvalidRequest;
                    result.rpcErrorMessage = 'Invalid content type; expects "' + BvspConstants_1.BvspConstants.contentType + '".';
                    return result;
                }
                let requestObj;
                try {
                    const promise = new Promise((resolve, reject) => {
                        let str = "";
                        context.request.on("data", (chunk) => {
                            str += chunk;
                        });
                        context.request.on("end", () => {
                            resolve(str);
                        });
                        context.request.on("error", (err) => {
                            reject(err);
                        });
                    });
                    const requestBodyString = yield promise;
                    requestObj = JSON.parse(requestBodyString);
                }
                catch (ex) {
                    result.httpCode = HttpStatusCode.BAD_REQUEST;
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.ParseError;
                    result.rpcErrorMessage = "Unable to parse request JSON.";
                    return result;
                }
                if (!JsonRpcHelper_1.default.isRequestValid(requestObj)) {
                    result.httpCode = HttpStatusCode.BAD_REQUEST;
                    result.rpcErrorCode = JsonRpcErrorCodes_1.JsonRpcErrorCodes.ParseError;
                    result.rpcErrorMessage = "The HTTP body is not a valid JSON RPC 2.0 request.";
                    return result;
                }
                result.requestObject = requestObj;
                result.successful = true;
                result.httpCode = HttpStatusCode.OK;
                result.rpcErrorCode = 0;
                return result;
            });
        }
        function dispatch(context, requestMessage, handlers, defaultHandler) {
            let handler = null;
            for (const kv of handlers) {
                if (requestMessage.method === kv[0]) {
                    handler = kv[1];
                    break;
                }
            }
            if (JsonRpc_1.default.debug) {
                let debugMessage;
                if (handler === null) {
                    debugMessage = `Received command ${requestMessage.method} but found no handler for it. Using default handler.`;
                }
                else {
                    const handlerName = handler.name ? handler.name : "(anonymous)";
                    debugMessage = `Received command ${requestMessage.method}, using handler: ${handlerName}`;
                }
                console.debug(debugMessage);
            }
            if (handler === null) {
                handler = defaultHandler;
            }
            const rpcContext = new ServerRpcContext_1.default(context, requestMessage);
            handler(rpcContext);
        }
    }
    __defaultMethodHandler(context) {
        context.httpContext.rpcError(HttpStatusCode.INTERNAL_SERVER_ERROR, JsonRpcErrorCodes_1.JsonRpcErrorCodes.MethodNotFound, "Method not found: " + context.message.method);
    }
    __serverError(err) {
        const address = this._server.address();
        if (err !== undefined) {
            console.error(err);
        }
        else {
            if (address === null) {
                console.warn("Unable to retrieve server address.");
            }
            else {
                console.debug(`RPC server started on ${address.address}:${address.port} (${address.family})`);
            }
        }
    }
}
__decorate([
    Override_1.default()
], JsonRpcServer.prototype, "disposeInternal", null);
exports.default = JsonRpcServer;
//# sourceMappingURL=JsonRpcServer.js.map