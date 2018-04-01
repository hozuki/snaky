"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const nls = require("../Nls");
class SnakyConfigLoader {
    static load() {
        const workspaceRootPath = vscode.workspace.rootPath;
        if (workspaceRootPath === undefined) {
            const warningMessage = nls.localize("snaky.error.configFileNotFound", "Config file \"snaky.json\" not found in current workspace.");
            vscode.window.showErrorMessage(warningMessage);
            return null;
        }
        const relativeConfigFilePath = "snaky.json";
        const absoluteConfigFilePath = path.join(workspaceRootPath, relativeConfigFilePath);
        const configFileData = fs.readFileSync(absoluteConfigFilePath, "utf-8");
        const configJson = JSON.parse(configFileData);
        return configJson;
    }
}
exports.default = SnakyConfigLoader;
//# sourceMappingURL=SnakyConfigLoader.js.map