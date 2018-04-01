"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const SnakyComm_1 = require("./SnakyComm");
let $comm = null;
const $debug = true;
/**
 * Global static state and configuration for Snaky.
 */
class SnakyState {
    /**
     * Gets whether debug mode is on.
     * @returns {boolean} {@see true} if debug mode is on, otherwise {@see false}.
     */
    static get debug() {
        return $debug;
    }
    static onActivate(context) {
        $comm = new SnakyComm_1.default();
        context.subscriptions.push(vscode.Disposable.from($comm));
        $comm.server.start();
    }
    static onDeactivate() {
    }
    static get comm() {
        return $comm;
    }
}
exports.default = SnakyState;
//# sourceMappingURL=SnakyState.js.map