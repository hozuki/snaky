"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Override_1 = require("../common/annotations/Override");
const CommonUtils_1 = require("../CommonUtils");
const nls = require("../Nls");
const JsonRpcServer_1 = require("../rpc/JsonRpcServer");
const CommonMethodNames_1 = require("./bvs/CommonMethodNames");
const Globals_1 = require("./Globals");
const SnakyConfigLoader_1 = require("./SnakyConfigLoader");
class SnakyServer extends JsonRpcServer_1.default {
    constructor(comm) {
        super();
        this._comm = comm;
    }
    onSimLaunched(context) {
        const params = context.message.params;
        // const p = params[0] as GeneralSimLaunchedNotificationParameter;
        // this._comm.simulatorServerUri = p.server_uri;
        this._comm.simulatorServerUri = params[0];
        if (Globals_1.default.debug) {
            console.debug("Simulator server URI: " + params[0]);
        }
        context.httpContext.ok();
        const configJson = SnakyConfigLoader_1.default.load();
        if (configJson !== null) {
            const infoMessageTemplate = nls.localize("snaky.info.simExeLaunched", "Launched simulator \"{0}\".");
            const infoMessage = CommonUtils_1.default.formatString(infoMessageTemplate, configJson.simName);
            vscode.window.showInformationMessage(infoMessage);
        }
    }
    onSimExited(context) {
        this._comm.simulatorServerUri = null;
        context.httpContext.ok();
        const configJson = SnakyConfigLoader_1.default.load();
        if (configJson !== null) {
            const infoMessageTemplate = nls.localize("snaky.info.simulatorExited", "Simulator \"{0}\" has exited.");
            const infoMessage = CommonUtils_1.default.formatString(infoMessageTemplate, configJson.simName);
            vscode.window.showInformationMessage(infoMessage);
        }
    }
    onPreviewPlaying(context) {
        context.httpContext.rpcNotImplemented();
    }
    onPreviewTick(context) {
        context.httpContext.rpcNotImplemented();
    }
    onPreviewPaused(context) {
        context.httpContext.rpcNotImplemented();
    }
    onPreviewStopped(context) {
        context.httpContext.rpcNotImplemented();
    }
    onPreviewSought(context) {
        context.httpContext.rpcNotImplemented();
    }
    onEditReloaded(context) {
        context.httpContext.ok();
    }
    registerMethodHandlers() {
        super.registerMethodHandlers();
        this.addMethodHandler(CommonMethodNames_1.CommonMethodNames.generalSimLaunched, this.onSimLaunched.bind(this));
        this.addMethodHandler(CommonMethodNames_1.CommonMethodNames.generalSimExited, this.onSimExited.bind(this));
        this.addMethodHandler(CommonMethodNames_1.CommonMethodNames.editReloaded, this.onEditReloaded.bind(this));
    }
}
__decorate([
    Override_1.default()
], SnakyServer.prototype, "registerMethodHandlers", null);
exports.default = SnakyServer;
//# sourceMappingURL=SnakyServer.js.map