const abstractSym = Symbol("@Abstract");

interface AbstractFields {
    symbol: symbol;
}

type AbstractType = ((ctor: Function) => void) & AbstractFields;

function Abstract(ctor: Function): void {
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

export default Abstract as AbstractType;
