import Override from "../common/annotations/Override";
import JsonRpcServer from "../rpc/JsonRpcServer";
import ServerRpcContext from "../rpc/ServerRpcContext";
import {CommonMethodNames} from "./bvs/CommonMethodNames";
import GeneralSimLaunchedNotificationParameter from "./bvs/SimLaunchedNotificationParameter";
import SnakyComm from "./SnakyComm";

export default class SnakyServer extends JsonRpcServer {

    constructor(comm: SnakyComm) {
        super();
        this._comm = comm;
    }

    protected onSimLaunched(context: ServerRpcContext): void {
        const params = context.message.params as any[];

        const p = params[0] as GeneralSimLaunchedNotificationParameter;

        this._comm.simulatorServerUri = p.server_uri;

        context.httpContext.ok().then();
    }

    protected onSimExited(context: ServerRpcContext): void {
        this._comm.simulatorServerUri = null;

        context.httpContext.ok();
    }

    protected onPreviewPlaying(context: ServerRpcContext): void {
        context.httpContext.rpcNotImplemented();
    }

    protected onPreviewTick(context: ServerRpcContext): void {
        context.httpContext.rpcNotImplemented();
    }

    protected onPreviewPaused(context: ServerRpcContext): void {
        context.httpContext.rpcNotImplemented();
    }

    protected onPreviewStopped(context: ServerRpcContext): void {
        context.httpContext.rpcNotImplemented();
    }

    protected onPreviewSought(context: ServerRpcContext): void {
        context.httpContext.rpcNotImplemented();
    }

    protected onEditReloaded(context: ServerRpcContext): void {
        context.httpContext.ok();
    }

    @Override()
    protected registerMethodHandlers() {
        super.registerMethodHandlers();

        this.addMethodHandler(CommonMethodNames.generalSimLaunched, this.onSimLaunched.bind(this));
        this.addMethodHandler(CommonMethodNames.generalSimExited, this.onSimExited.bind(this));
        this.addMethodHandler(CommonMethodNames.editReloaded, this.onEditReloaded.bind(this));
    }

    private readonly _comm: SnakyComm;

}