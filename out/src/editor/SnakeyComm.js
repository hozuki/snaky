"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SnakeyClient_1 = require("./SnakeyClient");
const SnakeyServer_1 = require("./SnakeyServer");
class SnakeyComm {
    constructor() {
        this._simulatorServerUri = null;
        this._client = new SnakeyClient_1.default(this);
        this._server = new SnakeyServer_1.default(this);
    }
    get client() {
        return this._client;
    }
    get server() {
        return this._server;
    }
    get simulatorServerUri() {
        return this._simulatorServerUri;
    }
    set simulatorServerUri(v) {
        this._simulatorServerUri = v;
    }
    dispose() {
        this._server.dispose();
    }
}
exports.default = SnakeyComm;
//# sourceMappingURL=SnakeyComm.js.map