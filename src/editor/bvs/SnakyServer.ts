import * as vscode from "vscode";
import Override from "../../common/annotations/Override";
import CommonUtils from "../../CommonUtils";
import * as nls from "../../Nls";
import JsonRpcServer from "../../rpc/JsonRpcServer";
import ServerRpcContext from "../../rpc/ServerRpcContext";
import {CommonMethodNames} from "./models/CommonMethodNames";
import GeneralSimLaunchedNotificationParameter from "./models/SimLaunchedNotificationParameter";
import SnakyComm from "./SnakyComm";
import SnakyConfig from "../SnakyConfig";
import SnakyWorkspaceConfig from "../SnakyWorkspaceConfig";

export default class SnakyServer extends JsonRpcServer {

    constructor(comm: SnakyComm) {
        super();
        this._comm = comm;
    }

    protected onSimLaunched(context: ServerRpcContext): void {
        const params = context.message.params as any[];

        const p0 = params[0] as GeneralSimLaunchedNotificationParameter;

        this._comm.simulatorServerUri = p0.server_uri;
        // this._comm.simulatorServerUri = params[0];

        if (SnakyConfig.debug) {
            // console.debug("Simulator server URI: " + params[0]);
            console.debug("Simulator server URI: ", p0.server_uri);
        }

        context.httpContext.ok();

        const configJson = SnakyWorkspaceConfig.load();

        if (configJson !== null) {
            const infoMessageTemplate = nls.localize("snaky.info.simExeLaunched", "Simulator \"{0}\" launched on {1}.");
            const infoMessage = CommonUtils.formatString(infoMessageTemplate, configJson.simName, p0.server_uri);
            vscode.window.showInformationMessage(infoMessage);
        }

        this._comm.client.sendSimInitializeRequest();
    }

    protected onSimExited(context: ServerRpcContext): void {
        this._comm.simulatorServerUri = null;

        context.httpContext.ok();

        const configJson = SnakyWorkspaceConfig.load();

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