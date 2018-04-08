'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Commands from "./editor/Commands";
import AffValidationProvider from "./editor/dsl/AffValidationProvider";
import SnakyState from "./editor/SnakyState";
import * as nls from "./Nls";

const snakyState = new SnakyState();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
    snakyState.activate(context);

    const commands = Commands(snakyState)();

    let cmd: vscode.Disposable;

    cmd = vscode.commands.registerCommand("snaky.command.launchSimulator", commands.launchSimulator);
    context.subscriptions.push(cmd);

    cmd = vscode.commands.registerCommand("snaky.command.previewPlay", commands.previewPlay);
    context.subscriptions.push(cmd);

    cmd = vscode.commands.registerCommand("snaky.command.previewPause", commands.previewPause);
    context.subscriptions.push(cmd);

    cmd = vscode.commands.registerCommand("snaky.command.previewStop", commands.previewStop);
    context.subscriptions.push(cmd);

    cmd = vscode.commands.registerCommand("snaky.command.editReload", commands.editReload);
    context.subscriptions.push(cmd);

    const affValidationProvider = new AffValidationProvider(context);
    context.subscriptions.push(affValidationProvider);

    vscode.window.showInformationMessage(nls.localize("snaky.info.activated", "Snaky is loaded and activated."));
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    snakyState.deactivate();
}
