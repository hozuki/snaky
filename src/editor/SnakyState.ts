import * as vscode from "vscode";
import SnakyComm from "./bvs/SnakyComm";
import StatusBarItems from "./StatusBarItems";

export default class SnakyState {

    activate(context: vscode.ExtensionContext): void {
        const comm = new SnakyComm(this);
        context.subscriptions.push(comm);

        this._comm = comm;

        comm.server.start();

        const statusBarItems = new StatusBarItems(this,context);
        context.subscriptions.push(statusBarItems);

        this._statusBarItems = statusBarItems;

        statusBarItems.updateStatusBar();
    }

    deactivate(): void {
    }

    get comm(): SnakyComm | null {
        return this._comm;
    }

    get statusBarItems():StatusBarItems | null {
        return this._statusBarItems;
    }

    private _comm:SnakyComm | null = null;
    private _statusBarItems:StatusBarItems | null = null;

}
