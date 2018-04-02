import * as vscode from "vscode";
import DisposableBase from "../DisposableBase";
import SnakyState from "./SnakyState";

export default class StatusBarItems extends DisposableBase {

    constructor(snakyState: SnakyState, context: vscode.ExtensionContext) {
        super();

        this._snakyState = snakyState;

        let statusBarItem: vscode.StatusBarItem;

        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.command = "snaky.command.launchSimulator";
        statusBarItem.text = "$(rocket) Launch Simulator";
        context.subscriptions.push(statusBarItem);
        this._launchSimulator = statusBarItem;

        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.command = "snaky.command.previewPlay";
        statusBarItem.text = "Play";
        context.subscriptions.push(statusBarItem);
        this._previewPlay = statusBarItem;

        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.command = "snaky.command.previewPause";
        statusBarItem.text = "Pause";
        context.subscriptions.push(statusBarItem);
        this._previewPause = statusBarItem;

        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.command = "snaky.command.previewStop";
        statusBarItem.text = "Stop";
        context.subscriptions.push(statusBarItem);
        this._previewStop = statusBarItem;
    }

    updateStatusBar(): void {
        const comm = this._snakyState.comm;

        if (comm === null) {
            this.launchSimulator.hide();
            this.previewPlay.hide();
            this.previewPause.hide();
            this.previewStop.hide();
        } else {
            if (comm.simulatorServerUri === null) {
                this.launchSimulator.show();
                this.previewPlay.hide();
                this.previewPause.hide();
                this.previewStop.hide();
            } else {
                this.launchSimulator.hide();
                this.previewPlay.show();
                this.previewPause.show();
                this.previewStop.show();
            }
        }
    }

    get launchSimulator(): vscode.StatusBarItem {
        return this._launchSimulator;
    }

    get previewPlay(): vscode.StatusBarItem {
        return this._previewPlay;
    }

    get previewPause(): vscode.StatusBarItem {
        return this._previewPause;
    }

    get previewStop(): vscode.StatusBarItem {
        return this._previewStop;
    }

    private readonly _launchSimulator: vscode.StatusBarItem;
    private readonly _previewPlay: vscode.StatusBarItem;
    private readonly _previewPause: vscode.StatusBarItem;
    private readonly _previewStop: vscode.StatusBarItem;

    private readonly _snakyState: SnakyState;

}
