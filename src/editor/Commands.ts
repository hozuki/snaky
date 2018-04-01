import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as stringArgv from "string-argv";
import * as vscode from "vscode";
import CommonUtils from "../CommonUtils";
import * as nls from "../Nls";
import Globals from "./Globals";
import SnakyConfigLoader from "./SnakyConfigLoader";

export function launchSimulator(): void {
    const comm = Globals.comm;

    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }

    const configJson = SnakyConfigLoader.load();

    if (configJson === null) {
        return;
    }

    if (!fs.existsSync(configJson.simExe) || !fs.lstatSync(configJson.simExe).isFile()) {
        const warningMessageTemplate = nls.localize("snaky.error.simExeNotFound", "Simulator executable '{0}' is not found.");
        vscode.window.showErrorMessage(CommonUtils.formatString(warningMessageTemplate, configJson.simExe));
        return;
    }

    const argsCommandLine = configJson.simArgs
        .replace("%server_uri%", comm.server.endPoint.address)
        // Legacy
        .replace("%editor_port%", comm.server.endPoint.port.toString());
    const args = stringArgv(argsCommandLine);
    const execOptions: child_process.SpawnOptions = {
        cwd: path.resolve(path.dirname(configJson.simExe))
    };

    if (Globals.debug) {
        console.debug("Launching simulator: " + configJson.simExe + " " + args.join(" "));
    }

    child_process.spawn(configJson.simExe, args, execOptions);

    {
        const infoMessageTemplate = nls.localize("snaky.info.simExeLaunching", "Launching simulator \"{0}\".");
        const infoMessage = CommonUtils.formatString(infoMessageTemplate, configJson.simName);
        vscode.window.showInformationMessage(infoMessage);
    }
}

export function previewPlay(): void {
    const comm = Globals.comm;

    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }

    comm.client.sendPlayRequest();
}

export function previewPause(): void {
    const comm = Globals.comm;

    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }

    comm.client.sendPauseRequest();
}

export function previewStop(): void {
    const comm = Globals.comm;

    if (comm === null || !comm.server.isRunning) {
        const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
        vscode.window.showWarningMessage(warningMessage);
        return;
    }

    comm.client.sendStopRequest();
}
