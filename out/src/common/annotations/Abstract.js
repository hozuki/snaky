"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstractSym = Symbol("@Abstract");
function Abstract(ctor) {
    for (const f of [ctor, ctor.prototype]) {
        Object.defineProperty(f, abstractSym, {
            enumerable: true,
            configurable: false,
            writable: false,
            value: true
        });
    }
}
Object.defineProperty(Abstract, "symbol", {
    enumerable: true,
    configurable: false,
    writable: false,
    value: abstractSym
});
exports.default = Abstract;
//# sourceMappingURL=Abstract.js.map