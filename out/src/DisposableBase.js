"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Abstract_1 = require("./common/annotations/Abstract");
/**
 * Base class for disposable objects.
 */
let DisposableBase = class DisposableBase extends events_1.EventEmitter {
    /**
     * Base class for disposable objects.
     */
    constructor() {
        super(...arguments);
        this._isDisposed = false;
    }
    /**
     * Gets whether this object is disposed.
     * @returns {boolean} {@see true} if this object is disposed, otherwise {@see false}.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Performs disposing action. Multiple calls to this method only disposes the object once.
     * After disposing, event "disposed" will be emitted.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.onDispose();
        this._isDisposed = true;
        this.emit("disposed");
    }
    /**
     * Disposing logic for child classes.
     */
    onDispose() {
    }
};
DisposableBase = __decorate([
    Abstract_1.default
], DisposableBase);
exports.default = DisposableBase;
//# sourceMappingURL=DisposableBase.js.map