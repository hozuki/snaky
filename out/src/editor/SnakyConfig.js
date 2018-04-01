"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const nls = require("../Nls");
let $cacheConfig = true;
let $configJson = null;
const relativeConfigFilePath = "snaky.json";
/**
 * Snaky configuration loader. For config objects, see {@see SnakyConfigFile}.
 */
class SnakyConfig {
    static get cacheConfig() {
        return $cacheConfig;
    }
    static set cacheConfig(v) {
        $cacheConfig = Boolean(v);
    }
    static load() {
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
        const configJson = JSON.parse(configFileData);
        $configJson = configJson;
        return configJson;
    }
}
exports.default = SnakyConfig;
//# sourceMappingURL=SnakyConfig.js.map