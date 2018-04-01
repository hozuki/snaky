"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Override_1 = require("../common/annotations/Override");
const DisposableBase_1 = require("../DisposableBase");
const SnakyClient_1 = require("./SnakyClient");
const SnakyServer_1 = require("./SnakyServer");
class SnakyComm extends DisposableBase_1.default {
    constructor() {
        super();
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
    onDispose() {
        this._server.dispose();
    }
}
__decorate([
    Override_1.default()
], SnakyComm.prototype, "onDispose", null);
exports.default = SnakyComm;
//# sourceMappingURL=SnakyComm.js.map