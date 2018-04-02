import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as nls from "../Nls";
import SnakyWorkspaceConfigFile from "./SnakyWorkspaceConfigFile";

let $cacheConfig = true;

let $configJson: SnakyWorkspaceConfigFile | null = null;

const relativeConfigFilePath = "snaky.json";

/**
 * Snaky configuration loader. For config objects, see {@see SnakyWorkspaceConfigFile}.
 */
export default abstract class SnakyWorkspaceConfig {

    static get cacheConfig(): boolean {
        return $cacheConfig;
    }

    static set cacheConfig(v: boolean) {
        $cacheConfig = Boolean(v);
    }

    static load(): SnakyWorkspaceConfigFile | null {
        if (SnakyWorkspaceConfig.cacheConfig && $configJson !== null) {
            return $configJson;
        }

        const workspaceRootPath = vscode.workspace.rootPath;

        if (workspaceRootPath === undefined) {
            const warningMessage = nls.localize("snaky.error.configFileNotFound", "Config file \"snaky.json\" not found in current workspace.");
            vscode.window.showErrorMessage(warningMessage);
            return null;
        }

        const absoluteConfigFilePath = path.join(workspaceRootPath, relativeConfigFilePath);

        const configFileData = fs.readFileSync(absoluteConfigFilePath, "utf-8");
        const configJson = JSON.parse(configFileData) as SnakyWorkspaceConfigFile;

        $configJson = configJson;

        return configJson;
    }

}