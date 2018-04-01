'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as Commands from "./editor/Commands";
import Globals from "./editor/Globals";
import * as nls from "./Nls";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
    Globals.onActivate(context);

    let cmd: vscode.Disposable;

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

// this method is called when your extension is deactivated
export function deactivate(): void {
    Globals.onDeactivate();
}
