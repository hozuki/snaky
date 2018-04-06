import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as stringArgv from "string-argv";
import * as util from "util";
import * as vscode from "vscode";
import CommonUtils from "../CommonUtils";
import * as nls from "../Nls";
import SnakyConfig from "./SnakyConfig";
import SnakyState from "./SnakyState";
import SnakyWorkspaceConfig from "./SnakyWorkspaceConfig";

export default (snakyState: SnakyState) => {
    return () => {
        return {
            launchSimulator,
            previewPlay,
            previewPause,
            previewStop,
            editReload
        };

        function launchSimulator(): void {
            const comm = snakyState.comm;

            if (comm === null || !comm.server.isRunning) {
                const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
                vscode.window.showWarningMessage(warningMessage);
                return;
            }

            const configJson = SnakyWorkspaceConfig.load();

            if (configJson === null) {
                return;
            }

            if (!fs.existsSync(configJson.simExe) || !fs.lstatSync(configJson.simExe).isFile()) {
                const warningMessageTemplate = nls.localize("snaky.error.simExeNotFound", "Simulator executable '{0}' is not found.");
                vscode.window.showErrorMessage(CommonUtils.formatString(warningMessageTemplate, configJson.simExe));
                return;
            }

            const endPoint = comm.server.endPoint;

            const argsCommandLine = configJson.simArgs
                .replace("%server_uri%", `http://${endPoint.address}:${endPoint.port}/`)
                // Legacy
                .replace("%editor_port%", endPoint.port.toString());
            const args = stringArgv(argsCommandLine);
            const execOptions: child_process.SpawnOptions = {
                cwd: path.resolve(path.dirname(configJson.simExe))
            };

            if (SnakyConfig.debug) {
                console.debug("Launching simulator: " + configJson.simExe + " " + args.join(" "));
            }

            child_process.spawn(configJson.simExe, args, execOptions);

            {
                const infoMessageTemplate = nls.localize("snaky.info.simExeLaunching", "Launching simulator \"{0}\".");
                const infoMessage = CommonUtils.formatString(infoMessageTemplate, configJson.simName);
                vscode.window.showInformationMessage(infoMessage);
            }
        }

        function editReload(): void {
            const comm = snakyState.comm;

            if (comm === null || !comm.server.isRunning) {
                const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
                vscode.window.showWarningMessage(warningMessage);
                return;
            }

            const activeEditor = vscode.window.activeTextEditor;

            if (util.isNullOrUndefined(activeEditor)) {
                return;
            }

            const activeDocument = activeEditor.document;

            if (activeDocument.isDirty) {
                const warningMessage = nls.localize("snaky.info.needToSaveBeforeReload", "You need to save current beatmap before reloading it in simulator.");
                vscode.window.showInformationMessage(warningMessage);
                return;
            }

            const documentPath = activeDocument.uri.fsPath;
            const documentDir = path.dirname(documentPath);

            let mp3Path: string = "";

            for (const fileName of fs.readdirSync(documentDir)) {
                if (fileName.endsWith(".mp3")) {
                    mp3Path = path.join(documentDir, fileName);
                    break;
                }
            }

            comm.client.sendReloadRequest(documentPath, mp3Path);
        }

        function previewPlay(): void {
            const comm = snakyState.comm;

            if (comm === null || !comm.server.isRunning) {
                const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
                vscode.window.showWarningMessage(warningMessage);
                return;
            }

            comm.client.sendPlayRequest();
        }

        function previewPause(): void {
            const comm = snakyState.comm;

            if (comm === null || !comm.server.isRunning) {
                const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
                vscode.window.showWarningMessage(warningMessage);
                return;
            }

            comm.client.sendPauseRequest();
        }

        function previewStop(): void {
            const comm = snakyState.comm;

            if (comm === null || !comm.server.isRunning) {
                const warningMessage = nls.localize("snaky.warning.rpcServerNotRunning", "BVSP server is not running.");
                vscode.window.showWarningMessage(warningMessage);
                return;
            }

            comm.client.sendStopRequest();
        }
    };
};
