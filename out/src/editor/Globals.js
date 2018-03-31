"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const SnakyComm_1 = require("./SnakyComm");
let $comm = null;
const $debug = true;
class Globals {
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
    static get debug() {
        return $debug;
    }
}
exports.default = Globals;
//# sourceMappingURL=Globals.js.map