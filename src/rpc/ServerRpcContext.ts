import RequestMessage from "./RequestMessage";
import ServerHttpContext from "./ServerHttpContext";

export default class ServerRpcContext {

    constructor(httpContext: ServerHttpContext, message: RequestMessage) {
        this._httpContext = httpContext;
        this._message = message;
    }

    get httpContext(): ServerHttpContext {
        return this._httpContext;
    }

    get message(): RequestMessage {
        return this._message;
    }

    private _httpContext: ServerHttpContext;
    private _message: RequestMessage;

}
