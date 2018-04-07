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

            const globalState = snakyState.extensionContext!.globalState;
            const defaultSimExe: string | null | undefined = globalState.get("arcaea.snaky.defaultSimExe");
            const defaultSimArgs: string | null | undefined = globalState.get("arcaea.snaky.defaultSimArgs");
            const defaultSimName: string | undefined = globalState.get("arcaea.snaky.defaultSimName");

            let simExe: string | null | undefined, simArgs: string | null | undefined, simName: string | undefined;

            const configJson = SnakyWorkspaceConfig.load();

            // If there is snaky.json under current directory, try to override the values in global config.
            if (configJson === null) {
                simExe = defaultSimExe;
                simArgs = defaultSimArgs;
                simName = defaultSimName;
            } else {
                if (!util.isNullOrUndefined(configJson.simExe)) {
                    simExe = configJson.simExe;
                } else {
                    simExe = defaultSimExe;
                }

                if (!util.isNullOrUndefined(configJson.simArgs)) {
                    simArgs = configJson.simArgs;
                } else {
                    simArgs = defaultSimArgs;
                }

                if (!util.isNullOrUndefined(configJson.simName)) {
                    simName = configJson.simName;
                } else {
                    simName = defaultSimName;
                }
            }

            if (util.isNullOrUndefined(simExe) || util.isNullOrUndefined(simArgs) || util.isNullOrUndefined(simName)) {
                const defaultErrorMessage = "Error(s) occurred in simulator configuration. Values cannot be null or undefined. Make sure you configured snaky.json and/or default settings correctly.";
                vscode.window.showErrorMessage("snaky.error.simConfigValueError", defaultErrorMessage);
                return;
            }

            if (!fs.existsSync(simExe) || !fs.lstatSync(simExe).isFile()) {
                const warningMessageTemplate = nls.localize("snaky.error.simExeNotFound", "Simulator executable '{0}' is not found.");
                vscode.window.showErrorMessage(CommonUtils.formatString(warningMessageTemplate, simExe));
                return;
            }

            const endPoint = comm.server.endPoint;

            const argsCommandLine = simArgs
                .replace("%server_uri%", `http://${endPoint.address}:${endPoint.port}/`)
                // Legacy
                .replace("%editor_port%", endPoint.port.toString());
            const args = stringArgv(argsCommandLine);
            const execOptions: child_process.SpawnOptions = {
                cwd: path.resolve(path.dirname(simExe))
            };

            if (SnakyConfig.debug) {
                console.debug(`Launching simulator: ${simExe} ${args.join(" ")}`);
            }

            child_process.spawn(simExe, args, execOptions);

            {
                const infoMessageTemplate = nls.localize("snaky.info.simExeLaunching", "Launching simulator \"{0}\".");
                const infoMessage = CommonUtils.formatString(infoMessageTemplate, simName);
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
            const documentFileName = path.basename(documentPath);
            const documentExt = path.extname(documentPath);

            let mp3Path: string = "";

            {
                // First, try to find the MP3 file whose name is identical to the beatmap (i.e. FILENAME.aff/FILENAME.snaky -> FILENAME.mp3).
                const guessedMp3FileName = documentFileName.substr(0, documentFileName.length - documentExt.length) + ".mp3";
                const guessedMp3Path = path.join(documentPath, guessedMp3FileName);

                if (fs.existsSync(guessedMp3Path)) {
                    mp3Path = guessedMp3Path;
                }
            }

            if (mp3Path.length <= 0) {
                // If failed, try to find the first MP3 file in the directory.
                for (const fileName of fs.readdirSync(documentDir)) {
                    const ext = path.extname(fileName);

                    if (!util.isNullOrUndefined(ext) && ext.toLowerCase() === ".mp3") {
                        mp3Path = path.join(documentDir, fileName);
                        break;
                    }
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
