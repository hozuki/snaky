import * as assert from "assert";
import * as http from "http";
import * as HttpStatusCode from "http-status-codes";
import {BvspConstants} from "../BvspConstants";
import Override from "../common/annotations/Override";
import DisposableBase from "../DisposableBase";
import JsonRpc from "./JsonRpc";
import {JsonRpcErrorCodes} from "./JsonRpcErrorCodes";
import JsonRpcHelper from "./JsonRpcHelper";
import MethodHandler from "./MethodHandler";
import RequestMessage from "./RequestMessage";
import ServerHttpContext from "./ServerHttpContext";
import ServerRpcContext from "./ServerRpcContext";

export default class JsonRpcServer extends DisposableBase {

    constructor() {
        super();

        this._server = http.createServer(this.__requestHandler.bind(this));
        this.registerMethodHandlers();
    }

    start(port?: number): void {
        if (port === undefined) {
            port = 0;
        } else {
            port = port | 0;
        }

        const ipv4Localhost = "127.0.0.1";

        this._server!.listen(port, ipv4Localhost, this.__serverError.bind(this));
    }

    stop(): void {
        this._server!.close();
    }

    get endPoint(): EndPoint {
        return this._server!.address();
    }

    get isRunning(): boolean {
        return this._server!.listening;
    }

    @Override()
    disposeInternal(): void {
        if (this.isRunning) {
            this.stop();
        }

        this._methodHandlers.clear();
    }

    protected addMethodHandler(method: string, handler: MethodHandler): this {
        this._methodHandlers.set(method, handler);
        return this;
    }

    protected removeMethodHandler(method: string): this {
        this._methodHandlers.delete(method);
        return this;
    }

    protected registerMethodHandlers(): void {
    }

    private __requestHandler(request: http.IncomingMessage, response: http.ServerResponse): void {
        const context = new ServerHttpContext(request, response);

        validateHeaders(context).then(validationResult => {
            if (!validationResult.successful) {

                if (JsonRpc.debug) {
                    console.debug(`RPC failed. HTTP Status: ${validationResult.httpCode} RPC Err: ${validationResult.rpcErrorCode} Message: ${validationResult.rpcErrorMessage}`);
                }

                context.rpcError(validationResult.httpCode, validationResult.rpcErrorCode, validationResult.rpcErrorMessage);
                return;
            }

            assert.notEqual(validationResult.requestObject, null);

            dispatch(context, validationResult.requestObject!, this._methodHandlers, this.__defaultMethodHandler.bind(this));
        }, err => {
            if (err !== undefined) {
                console.error(err);
            }
        });

        async function validateHeaders(context: ServerHttpContext): Promise<RequestValidationResult> {
            const result: RequestValidationResult = {
                successful: false,
                httpCode: HttpStatusCode.BAD_REQUEST,
                rpcErrorCode: JsonRpcErrorCodes.UnknownErrorCode,
                rpcErrorMessage: "Unknown error",
                requestObject: null
            };

            if (context.request.method === undefined) {
                result.httpCode = HttpStatusCode.BAD_REQUEST;
                result.rpcErrorCode = JsonRpcErrorCodes.InvalidRequest;
                result.rpcErrorMessage = "Missing request method.";
                return result;
            }

            if (context.request.method.toLowerCase() !== "post") {
                result.httpCode = HttpStatusCode.METHOD_NOT_ALLOWED;
                result.rpcErrorCode = JsonRpcErrorCodes.InvalidRequest;
                result.rpcErrorMessage = "Invalid request method; expect POST.";
                return result;
            }

            const headers = context.request.headers;

            if (headers["content-length"] === undefined) {
                result.rpcErrorCode = JsonRpcErrorCodes.InvalidRequest;
                result.rpcErrorMessage = "Content-Length header is missing.";
                return result;
            }

            // TODO: More security concerns...
            const contentLengthValue = Number.parseInt(headers["content-length"] as string);

            if (contentLengthValue <= 0) {
                result.rpcErrorCode = JsonRpcErrorCodes.InvalidRequest;
                result.rpcErrorMessage = "Invalid content length.";
                return result;
            }

            const contentTypeValue = headers["content-type"] as string;

            if (contentTypeValue === undefined) {
                result.rpcErrorCode = JsonRpcErrorCodes.InvalidRequest;
                result.rpcErrorMessage = "Content-Type header is missing.";
                return result;
            }

            if (contentTypeValue !== BvspConstants.contentType) {
                result.rpcErrorCode = JsonRpcErrorCodes.InvalidRequest;
                result.rpcErrorMessage = 'Invalid content type; expects "' + BvspConstants.contentType + '".';
                return result;
            }

            let requestObj: object;

            try {
                const promise = new Promise((resolve: Function, reject: Function) => {
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

                const requestBodyString = await promise as string;

                requestObj = JSON.parse(requestBodyString);
            } catch (ex) {
                result.httpCode = HttpStatusCode.BAD_REQUEST;
                result.rpcErrorCode = JsonRpcErrorCodes.ParseError;
                result.rpcErrorMessage = "Unable to parse request JSON.";
                return result;
            }

            if (!JsonRpcHelper.isRequestValid(requestObj)) {
                result.httpCode = HttpStatusCode.BAD_REQUEST;
                result.rpcErrorCode = JsonRpcErrorCodes.ParseError;
                result.rpcErrorMessage = "The HTTP body is not a valid JSON RPC 2.0 request.";
                return result;
            }

            result.requestObject = requestObj as RequestMessage;

            result.successful = true;
            result.httpCode = HttpStatusCode.OK;
            result.rpcErrorCode = 0;

            return result;
        }

        function dispatch(context: ServerHttpContext, requestMessage: RequestMessage, handlers: Map<string, MethodHandler>, defaultHandler: MethodHandler): void {
            let handler: MethodHandler | null = null;

            for (const kv of handlers) {
                if (requestMessage.method === (kv[0] as string)) {
                    handler = kv[1] as MethodHandler;
                    break;
                }
            }

            if (JsonRpc.debug) {
                let debugMessage: string;

                if (handler === null) {
                    debugMessage = `Received command ${requestMessage.method} but found no handler for it. Using default handler.`;
                } else {
                    const handlerName = handler.name ? handler.name : "(anonymous)";
                    debugMessage = `Received command ${requestMessage.method}, using handler: ${handlerName}`;
                }

                console.debug(debugMessage);
            }

            if (handler === null) {
                handler = defaultHandler;
            }

            const rpcContext = new ServerRpcContext(context, requestMessage);

            handler(rpcContext);
        }
    }

    private __defaultMethodHandler(context: ServerRpcContext): void {
        context.httpContext.rpcError(HttpStatusCode.INTERNAL_SERVER_ERROR, JsonRpcErrorCodes.MethodNotFound, "Method not found: " + context.message.method);
    }

    private __serverError(err?: Error): void {
        const address = this._server!.address();

        if (err !== undefined) {
            console.error(err);
        } else {
            if (address === null) {
                console.warn("Unable to retrieve server address.");
            } else {
                console.debug(`RPC server started on ${address.address}:${address.port} (${address.family})`);
            }
        }
    }

    private _methodHandlers: Map<string, MethodHandler> = new Map();
    private _server: http.Server | null = null;

}

type RequestValidationResult = {
    successful: boolean;
    httpCode: number;
    rpcErrorCode: number;
    rpcErrorMessage: string;
    requestObject: RequestMessage | null;
};

type EndPoint = {
    port: number;
    family: string;
    address: string;
};
