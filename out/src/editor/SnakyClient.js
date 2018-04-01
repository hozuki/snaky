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
const vscode = require("vscode");
const nls = require("../Nls");
const JsonRpcClient_1 = require("../rpc/JsonRpcClient");
const CommonMethodNames_1 = require("./bvs/CommonMethodNames");
class SnakyClient extends JsonRpcClient_1.default {
    constructor(comm) {
        super();
        this._comm = comm;
    }
    sendSimInitializeRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [];
            return this.safeSendRequest(CommonMethodNames_1.CommonMethodNames.generalSimInitialize, params);
        });
    }
    sendPlayRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.safeSendRequest(CommonMethodNames_1.CommonMethodNames.previewPlay);
        });
    }
    sendPauseRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.safeSendRequest(CommonMethodNames_1.CommonMethodNames.previewPause);
        });
    }
    sendStopRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.safeSendRequest(CommonMethodNames_1.CommonMethodNames.previewStop);
        });
    }
    sendReloadRequest(beatmapFile, beatmapIndex, beatmapOffset, backgroundMusicFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const p1 = {
                beatmap_file: beatmapFile,
                beatmap_index: beatmapIndex,
                beatmap_offset: beatmapOffset,
                background_music_file: backgroundMusicFile
            };
            const params = [p1];
            return this.safeSendRequest(CommonMethodNames_1.CommonMethodNames.editReload, params);
        });
    }
    sendEdExitedNotification() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.safeSendNotification(CommonMethodNames_1.CommonMethodNames.generalEdExited);
        });
    }
    safeSendRequest(method, params = null, id = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = this._comm.simulatorServerUri;
            if (uri === null || uri === undefined) {
                vscode.window.showWarningMessage(nls.localize("snaky.warning.simulatorNotRunning", "No active simulator found."));
                return null;
            }
            else {
                return this.sendRequest(uri, method, params, id);
            }
        });
    }
    safeSendNotification(method, params = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = this._comm.simulatorServerUri;
            if (uri === null || uri === undefined) {
                vscode.window.showWarningMessage(nls.localize("snaky.warning.simulatorNotRunning", "No active simulator found."));
                return;
            }
            else {
                return this.sendNotification(uri, method, params);
            }
        });
    }
}
exports.default = SnakyClient;
//# sourceMappingURL=SnakyClient.js.map