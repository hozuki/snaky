'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const Commands = require("./editor/Commands");
const SnakyState_1 = require("./editor/SnakyState");
const nls = require("./Nls");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    SnakyState_1.default.onActivate(context);
    let cmd;
    cmd = vscode.commands.registerCommand("snaky.command.launchSimulator", Commands.launchSimulator);
    context.subscriptions.push(cmd);
    cmd = vscode.commands.registerCommand("snaky.command.previewPlay", Commands.previewPlay);
    context.subscriptions.push(cmd);
    cmd = vscode.commands.registerCommand("snaky.command.previewPause", Commands.previewPause);
    context.subscriptions.push(cmd);
    cmd = vscode.commands.registerCommand("snaky.command.previewStop", Commands.previewStop);
    context.subscriptions.push(cmd);
    vscode.window.showInformationMessage(nls.localize("snaky.info.activated", "Snaky is loaded and activated."));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    SnakyState_1.default.onDeactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map