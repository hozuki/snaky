import Override from "../common/annotations/Override";
import DisposableBase from "../DisposableBase";
import SnakyClient from "./SnakyClient";
import SnakyServer from "./SnakyServer";

export default class SnakyComm extends DisposableBase {

    constructor() {
        super();

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
    }

    @Override()
    disposeInternal(): void {
        this._server.dispose();
    }

    private _client: SnakyClient;
    private _server: SnakyServer;

    private _simulatorServerUri: string | null = null;

}