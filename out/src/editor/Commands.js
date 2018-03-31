"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const stringArgv = require("string-argv");
const vscode = require("vscode");
const CommonUtils_1 = require("../CommonUtils");
const nls = require("../Nls");
const Globals_1 = require("./Globals");
function launchSimulator() {
    const comm = Globals_1.default.comm;
    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.error.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }
    const workspaceRootPath = vscode.workspace.rootPath;
    if (workspaceRootPath === undefined) {
        const warningMessage = nls.localize("snaky.error.configFileNotFound", "Cannot start the simulator without config file (snaky.json).");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }
    const relativeConfigFilePath = "snaky.json";
    const absoluteConfigFilePath = path.join(workspaceRootPath, relativeConfigFilePath);
    const configFileData = fs.readFileSync(absoluteConfigFilePath, "utf-8");
    const configJson = JSON.parse(configFileData);
    if (!fs.existsSync(configJson.simExe) || !fs.lstatSync(configJson.simExe).isFile()) {
        // const warningMessageTemplate = localize("snaky.error.simExeNotFound", "Simulator executable '{0}' is not found.");
        const warningMessageTemplate = nls.localize(5, "Simulator executable '{0}' is not found.");
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
    if (Globals_1.default.debug) {
        console.debug("Launching simulator: " + configJson.simExe + " " + args.join(" "));
    }
    child_process.execFile(configJson.simExe, args, execOptions);
    {
        const infoMessageTemplate = nls.localize("snaky.info.simExeLaunched", "Launched simulator \"{0}\".");
        const infoMessage = CommonUtils_1.default.formatString(infoMessageTemplate, configJson.simName);
        vscode.window.showInformationMessage(infoMessage);
    }
}
exports.launchSimulator = launchSimulator;
//# sourceMappingURL=Commands.js.map