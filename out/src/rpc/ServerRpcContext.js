"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerRpcContext {
    constructor(httpContext, message) {
        this._httpContext = httpContext;
        this._message = message;
    }
    get httpContext() {
        return this._httpContext;
    }
    get message() {
        return this._message;
    }
}
exports.default = ServerRpcContext;
//# sourceMappingURL=ServerRpcContext.js.map