import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as nls from "../Nls";
import SnakyConfigFile from "./SnakyConfigFile";

let $cacheConfig = true;

let $configJson: SnakyConfigFile | null = null;

const relativeConfigFilePath = "snaky.json";

/**
 * Snaky configuration loader. For config objects, see {@see SnakyConfigFile}.
 */
export default abstract class SnakyConfig {

    static get cacheConfig(): boolean {
        return $cacheConfig;
    }

    static set cacheConfig(v: boolean) {
        $cacheConfig = Boolean(v);
    }

    static load(): SnakyConfigFile | null {
        if (SnakyConfig.cacheConfig && $configJson !== null) {
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
        const configJson = JSON.parse(configFileData) as SnakyConfigFile;

        $configJson = configJson;

        return configJson;
    }

}