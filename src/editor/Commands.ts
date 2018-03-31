import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as stringArgv from "string-argv";
import * as vscode from "vscode";
import CommonUtils from "../CommonUtils";
import * as nls from "../Nls";
import Globals from "./Globals";
import SnakyConfig from "./SnakyConfig";

export function launchSimulator(): void {
    const comm = Globals.comm;

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
    const configJson = JSON.parse(configFileData) as SnakyConfig;

    if (!fs.existsSync(configJson.simExe) || !fs.lstatSync(configJson.simExe).isFile()) {
        // const warningMessageTemplate = localize("snaky.error.simExeNotFound", "Simulator executable '{0}' is not found.");
        const warningMessageTemplate = nls.localize(<any>5, "Simulator executable '{0}' is not found.");
        vscode.window.showErrorMessage(CommonUtils.formatString(warningMessageTemplate, configJson.simExe));
        return;
    }

    const argsCommandLine = configJson.simArgs
        .replace("%server_uri%", comm.server.endPoint.address)
        // Legacy
        .replace("%editor_port%", comm.server.endPoint.port.toString());
    const args = stringArgv(argsCommandLine);
    const execOptions: child_process.ExecFileOptions = {
        cwd: path.resolve(path.dirname(configJson.simExe))
    };

    if (Globals.debug) {
        console.debug("Launching simulator: " + configJson.simExe + " " + args.join(" "));
    }

    child_process.execFile(configJson.simExe, args, execOptions);

    {
        const infoMessageTemplate = nls.localize("snaky.info.simExeLaunched", "Launched simulator \"{0}\".");
        const infoMessage = CommonUtils.formatString(infoMessageTemplate, configJson.simName);
        vscode.window.showInformationMessage(infoMessage);
    }
}
