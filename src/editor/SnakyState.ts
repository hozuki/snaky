import * as vscode from "vscode";
import SnakyComm from "./bvs/SnakyComm";
import StatusBarItems from "./StatusBarItems";

let $state: SnakyState | null = null;

export default class SnakyState {

    constructor() {
        if ($state) {
            console.warn("Warning: SnakyState is constructed more than once. Ignoring previous instantiation(s).");
        }

        $state = this;
    }

    static get current(): SnakyState | null {
        return $state;
    }

    activate(context: vscode.ExtensionContext): void {
        this._extensionContext = context;

        const comm = new SnakyComm(this);
        context.subscriptions.push(comm);

        this._comm = comm;

        comm.server.start();

        const statusBarItems = new StatusBarItems(this, context);
        context.subscriptions.push(statusBarItems);

        this._statusBarItems = statusBarItems;

        statusBarItems.updateStatusBar();
    }

    deactivate(): void {
        this._extensionContext = null;
    }

    get extensionContext(): vscode.ExtensionContext | null {
        return this._extensionContext;
    }

    get comm(): SnakyComm | null {
        return this._comm;
    }

    get statusBarItems(): StatusBarItems | null {
        return this._statusBarItems;
    }

    private _extensionContext: vscode.ExtensionContext | null = null;
    private _comm: SnakyComm | null = null;
    private _statusBarItems: StatusBarItems | null = null;

}
