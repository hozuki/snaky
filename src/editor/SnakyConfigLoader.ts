import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as nls from "../Nls";
import SnakyConfig from "./SnakyConfig";

export default class SnakyConfigLoader {

    static load(): SnakyConfig | null {
        const workspaceRootPath = vscode.workspace.rootPath;

        if (workspaceRootPath === undefined) {
            const warningMessage = nls.localize("snaky.error.configFileNotFound", "Config file \"snaky.json\" not found in current workspace.");
            vscode.window.showErrorMessage(warningMessage);
            return null;
        }

        const relativeConfigFilePath = "snaky.json";
        const absoluteConfigFilePath = path.join(workspaceRootPath, relativeConfigFilePath);

        const configFileData = fs.readFileSync(absoluteConfigFilePath, "utf-8");
        const configJson = JSON.parse(configFileData) as SnakyConfig;

        return configJson;
    }

}