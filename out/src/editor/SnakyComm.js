"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SnakyClient_1 = require("./SnakyClient");
const SnakyServer_1 = require("./SnakyServer");
class SnakyComm {
    constructor() {
        this._simulatorServerUri = null;
        this._client = new SnakyClient_1.default(this);
        this._server = new SnakyServer_1.default(this);
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
exports.default = SnakyComm;
//# sourceMappingURL=SnakyComm.js.map