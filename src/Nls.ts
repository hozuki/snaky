import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

interface NlsOptions {
    locale?: string;
    cacheLanguageResolution?: boolean;
    messageFormat?: MessageFormat;
    availableLanguages?: { [key: string]: string };
}

enum MessageFormat {
    file = 'file',
    bundle = 'bundle',
    both = 'both'
}

const nlsConfigString = process.env.VSCODE_NLS_CONFIG;

let nlsConfig: NlsOptions;

if (nlsConfigString === undefined) {
    nlsConfig = {
        locale: "",
        cacheLanguageResolution: true
    };
} else {
    nlsConfig = JSON.parse(nlsConfigString) as NlsOptions;

    if (nlsConfig.locale === undefined) {
        nlsConfig.locale = vscode.env.language;
    }

    if (nlsConfig.cacheLanguageResolution === undefined) {
        nlsConfig.cacheLanguageResolution = true;
    } else {
        nlsConfig.cacheLanguageResolution = Boolean(nlsConfig.cacheLanguageResolution);
    }
}

function loadPackageJson(config: NlsOptions): { [key: string]: string } | null {
    if (config.locale === undefined) {
        throw new TypeError("Locale is undefined in NLS config.");
    }

    const expectedName = config.locale.length > 0 ? `package.nls.${config.locale}.json` : "package.nls.json";

    let currentPath = path.resolve(__dirname);
    let parentPath = path.resolve(path.join(currentPath, ".."));
    let packageJsonNlsName = path.join(currentPath, expectedName);

    let result: { [key: string]: string } | null = null;

    while (currentPath !== parentPath) {
        // vscode.window.showInformationMessage("Searching for " + packageJsonNlsName);

        if (fs.existsSync(packageJsonNlsName) && fs.lstatSync(packageJsonNlsName).isFile()) {
            // vscode.window.showInformationMessage("Using locale file " + packageJsonNlsName);

            const fileContent = fs.readFileSync(packageJsonNlsName, "utf-8");
            result = JSON.parse(fileContent);
            break;
        } else {
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

interface Nls {

    localize(key: string, defaultValue: string): string;

}

const nls: Nls = {
    localize: (key: string, defaultValue: string): string => {
        if (nlsPackageJson === null) {
            return defaultValue;
        } else {
            if (Object.prototype.hasOwnProperty.call(nlsPackageJson, key)) {
                return String(nlsPackageJson[key]);
            } else {
                return defaultValue;
            }
        }
    }
};

export = nls;
