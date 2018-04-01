import * as vscode from "vscode";
import Override from "../common/annotations/Override";
import CommonUtils from "../CommonUtils";
import * as nls from "../Nls";
import JsonRpcServer from "../rpc/JsonRpcServer";
import ServerRpcContext from "../rpc/ServerRpcContext";
import {CommonMethodNames} from "./bvs/CommonMethodNames";
import SnakyComm from "./SnakyComm";
import SnakyConfig from "./SnakyConfig";
import SnakyState from "./SnakyState";

export default class SnakyServer extends JsonRpcServer {

    constructor(comm: SnakyComm) {
        super();
        this._comm = comm;
    }

    protected onSimLaunched(context: ServerRpcContext): void {
        const params = context.message.params as any[];

        // const p = params[0] as GeneralSimLaunchedNotificationParameter;

        // this._comm.simulatorServerUri = p.server_uri;
        this._comm.simulatorServerUri = params[0];

        if (SnakyState.debug) {
            console.debug("Simulator server URI: " + params[0]);
        }

        context.httpContext.ok();

        const configJson = SnakyConfig.load();

        if (configJson !== null) {
            const infoMessageTemplate = nls.localize("snaky.info.simExeLaunched", "Launched simulator \"{0}\".");
            const infoMessage = CommonUtils.formatString(infoMessageTemplate, configJson.simName);
            vscode.window.showInformationMessage(infoMessage);
        }
    }

    protected onSimExited(context: ServerRpcContext): void {
        this._comm.simulatorServerUri = null;

        context.httpContext.ok();

        const configJson = SnakyConfig.load();

        if (configJson !== null) {
            const infoMessageTemplate = nls.localize("snaky.info.simulatorExited", "Simulator \"{0}\" has exited.");
            const infoMessage = CommonUtils.formatString(infoMessageTemplate, configJson.simName);
            vscode.window.showInformationMessage(infoMessage);
        }
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