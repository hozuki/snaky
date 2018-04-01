import * as vscode from "vscode";
import SnakyComm from "./SnakyComm";

let $comm: SnakyComm | null = null;

const $debug = true;

/**
 * Global static state and configuration for Snaky.
 */
export default abstract class SnakyState {

    /**
     * Gets whether debug mode is on.
     * @returns {boolean} {@see true} if debug mode is on, otherwise {@see false}.
     */
    static get debug(): boolean {
        return $debug;
    }

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

}
