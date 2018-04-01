'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const Commands = require("./editor/Commands");
const Globals_1 = require("./editor/Globals");
const nls = require("./Nls");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    Globals_1.default.onActivate(context);
    const launchSimulatorCommand = vscode.commands.registerCommand("snaky.command.launchSimulator", Commands.launchSimulator);
    context.subscriptions.push(launchSimulatorCommand);
    vscode.window.showInformationMessage(nls.localize("snaky.info.activated", "Snaky is loaded and activated."));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    Globals_1.default.onDeactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map