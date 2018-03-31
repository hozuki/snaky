"use strict";
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
var MessageFormat;
(function (MessageFormat) {
    MessageFormat["file"] = "file";
    MessageFormat["bundle"] = "bundle";
    MessageFormat["both"] = "both";
})(MessageFormat || (MessageFormat = {}));
const nlsConfigString = process.env.VSCODE_NLS_CONFIG;
let nlsConfig;
if (nlsConfigString === undefined) {
    nlsConfig = {
        locale: "",
        cacheLanguageResolution: true
    };
}
else {
    nlsConfig = JSON.parse(nlsConfigString);
    if (nlsConfig.locale === undefined) {
        nlsConfig.locale = vscode.env.language;
    }
    if (nlsConfig.cacheLanguageResolution === undefined) {
        nlsConfig.cacheLanguageResolution = true;
    }
    else {
        nlsConfig.cacheLanguageResolution = Boolean(nlsConfig.cacheLanguageResolution);
    }
}
function loadPackageJson(config) {
    if (config.locale === undefined) {
        throw new TypeError("Locale is undefined in NLS config.");
    }
    const expectedName = config.locale.length > 0 ? `package.nls.${config.locale}.json` : "package.nls.json";
    let currentPath = path.resolve(__dirname);
    let parentPath = path.resolve(path.join(currentPath, ".."));
    let packageJsonNlsName = path.join(currentPath, expectedName);
    let result = null;
    while (currentPath !== parentPath) {
        // vscode.window.showInformationMessage("Searching for " + packageJsonNlsName);
        if (fs.existsSync(packageJsonNlsName) && fs.lstatSync(packageJsonNlsName).isFile()) {
            // vscode.window.showInformationMessage("Using locale file " + packageJsonNlsName);
            const fileContent = fs.readFileSync(packageJsonNlsName, "utf-8");
            result = JSON.parse(fileContent);
            break;
        }
        else {
            currentPath = parentPath;
            parentPath = path.resolve(path.join(currentPath, ".."));
            packageJsonNlsName = path.join(currentPath, expectedName);
        }
    }
    // if (result === null){
    //     vscode.window.showInformationMessage("Using default locale.");
    // }
    return result;
}
const nlsPackageJson = loadPackageJson(nlsConfig);
const nls = {
    localize: (key, defaultValue) => {
        if (nlsPackageJson === null) {
            return defaultValue;
        }
        else {
            if (Object.prototype.hasOwnProperty.call(nlsPackageJson, key)) {
                return String(nlsPackageJson[key]);
            }
            else {
                return defaultValue;
            }
        }
    }
};
module.exports = nls;
//# sourceMappingURL=Nls.js.map