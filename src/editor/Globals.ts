import * as vscode from "vscode";
import SnakyComm from "./SnakyComm";

let $comm: SnakyComm | null = null;

const $debug = true;

export default abstract class Globals {

    static onActivate(context: vscode.ExtensionContext): void {
        $comm = new SnakyComm();

        context.subscriptions.push(vscode.Disposable.from($comm));

        $comm.server.start();
    }

    static onDeactivate(): void {
    }

    static get comm(): SnakyComm | null {
        return $comm;
    }

    static get debug(): boolean {
        return $debug;
    }

}
