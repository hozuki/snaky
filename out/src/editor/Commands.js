"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const stringArgv = require("string-argv");
const vscode = require("vscode");
const CommonUtils_1 = require("../CommonUtils");
const nls = require("../Nls");
const SnakyConfig_1 = require("./SnakyConfig");
const SnakyState_1 = require("./SnakyState");
function launchSimulator() {
    const comm = SnakyState_1.default.comm;
    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }
    const configJson = SnakyConfig_1.default.load();
    if (configJson === null) {
        return;
    }
    if (!fs.existsSync(configJson.simExe) || !fs.lstatSync(configJson.simExe).isFile()) {
        const warningMessageTemplate = nls.localize("snaky.error.simExeNotFound", "Simulator executable '{0}' is not found.");
        vscode.window.showErrorMessage(CommonUtils_1.default.formatString(warningMessageTemplate, configJson.simExe));
        return;
    }
    const argsCommandLine = configJson.simArgs
        .replace("%server_uri%", comm.server.endPoint.address)
        // Legacy
        .replace("%editor_port%", comm.server.endPoint.port.toString());
    const args = stringArgv(argsCommandLine);
    const execOptions = {
        cwd: path.resolve(path.dirname(configJson.simExe))
    };
    if (SnakyState_1.default.debug) {
        console.debug("Launching simulator: " + configJson.simExe + " " + args.join(" "));
    }
    child_process.spawn(configJson.simExe, args, execOptions);
    {
        const infoMessageTemplate = nls.localize("snaky.info.simExeLaunching", "Launching simulator \"{0}\".");
        const infoMessage = CommonUtils_1.default.formatString(infoMessageTemplate, configJson.simName);
        vscode.window.showInformationMessage(infoMessage);
    }
}
exports.launchSimulator = launchSimulator;
function previewPlay() {
    const comm = SnakyState_1.default.comm;
    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }
    comm.client.sendPlayRequest();
}
exports.previewPlay = previewPlay;
function previewPause() {
    const comm = SnakyState_1.default.comm;
    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }
    comm.client.sendPauseRequest();
}
exports.previewPause = previewPause;
function previewStop() {
    const comm = SnakyState_1.default.comm;
    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }
    comm.client.sendStopRequest();
}
exports.previewStop = previewStop;
//# sourceMappingURL=Commands.js.map