import {EventEmitter} from "events";
import Abstract from "./common/annotations/Abstract";
import IDisposable from "./IDisposable";

/**
 * Base class for disposable objects.
 */
@Abstract
export default abstract class DisposableBase extends EventEmitter implements IDisposable {

    /**
     * Gets whether this object is disposed.
     * @returns {boolean} {@see true} if this object is disposed, otherwise {@see false}.
     */
    get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**
     * Performs disposing action. Multiple calls to this method only disposes the object once.
     * After disposing, event "disposed" will be emitted.
     */
    dispose(): void {
        if (this.isDisposed) {
            return;
        }

        this.disposeInternal();

        this._isDisposed = true;

        this.emit("disposed");

        this.removeAllListeners("disposed");
    }

    onDispose(listener: (...args: any[]) => void, thisArgs?: any): void {
        if (thisArgs !== undefined) {
            listener = listener.bind(thisArgs);
        }

        this.addListener("disposed", listener);
    }

    /**
     * Disposing logic for child classes.
     */
    protected disposeInternal(): void {
    }

    private _isDisposed: boolean = false;

}
