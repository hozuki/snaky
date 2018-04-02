import Override from "../common/annotations/Override";
import DisposableBase from "../DisposableBase";
import SnakyClient from "./SnakyClient";
import SnakyServer from "./SnakyServer";
import SnakyState from "./SnakyState";

export default class SnakyComm extends DisposableBase {

    constructor(snakyState: SnakyState) {
        super();

        this._snakyState = snakyState;

        this._client = new SnakyClient(this);
        this._server = new SnakyServer(this);
    }

    get client(): SnakyClient {
        return this._client;
    }

    get server(): SnakyServer {
        return this._server;
    }

    get simulatorServerUri(): string | null {
        return this._simulatorServerUri;
    }

    set simulatorServerUri(v: string | null) {
        this._simulatorServerUri = v;

        const statusBarItems = this._snakyState.statusBarItems;

        if (statusBarItems !== null) {
            statusBarItems.updateStatusBar();
        }
    }

    @Override()
    protected disposeInternal(): void {
        this._server.dispose();
    }

    private _client: SnakyClient;
    private _server: SnakyServer;

    private _simulatorServerUri: string | null = null;

    private readonly _snakyState: SnakyState;

}