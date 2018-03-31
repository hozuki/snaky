"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCode = require("http-status-codes");
const BvspConstants_1 = require("../BvspConstants");
const JsonRpcErrorCodes_1 = require("./JsonRpcErrorCodes");
const serverSignature = "Node Server for BVSP";
class ServerHttpContext {
    constructor(request, response) {
        this._request = request;
        this._response = response;
    }
    get request() {
        return this._request;
    }
    get response() {
        return this._response;
    }
    respond(code, body) {
        return __awaiter(this, void 0, void 0, function* () {
            this.response.statusCode = code;
            this.response.statusMessage = HttpStatusCode.getStatusText(code);
            const currentDate = new Date();
            const headers = {
                "X-Server": serverSignature,
                "Date": currentDate.toUTCString(),
                "Content-Type": BvspConstants_1.BvspConstants.contentType
            };
            if (body !== undefined) {
                const buffer = new Buffer(body);
                headers["Content-Length"] = buffer.length;
            }
            this.response.writeHead(this.response.statusCode, this.response.statusMessage, headers);
            if (body !== undefined && body !== null) {
                this.response.write(body);
            }
            this.response.end();
        });
    }
    ok(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.respond(HttpStatusCode.OK, body);
        });
    }
    rpcOk(result, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseMessage = {
                jsonrpc: "2.0",
                result: result
            };
            if (id !== undefined) {
                responseMessage.id = id;
            }
            const responseBodyText = JSON.stringify(responseMessage);
            return this.ok(responseBodyText);
        });
    }
    rpcError(httpCode, rpcCode, rpcMessage, id, rpcErrorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const errorObject = {
                code: rpcCode,
                message: rpcMessage
            };
            if (rpcErrorData !== undefined) {
                errorObject.data = rpcErrorData;
            }
            const responseMessage = {
                jsonrpc: "2.0",
                error: errorObject
            };
            if (id !== undefined) {
                responseMessage.id = id;
            }
            const responseBodyText = JSON.stringify(responseMessage);
            return this.respond(httpCode, responseBodyText);
        });
    }
    rpcNotImplemented(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rpcError(HttpStatusCode.INTERNAL_SERVER_ERROR, JsonRpcErrorCodes_1.JsonRpcErrorCodes.InternalError, "Method not implemented", id);
        });
    }
}
exports.default = ServerHttpContext;
//# sourceMappingURL=ServerHttpContext.js.map