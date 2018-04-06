import * as util from "util";
import * as vscode from "vscode";
import * as nls from "../../Nls";
import JsonRpcClient from "../../rpc/JsonRpcClient";
import ResponseMessage from "../../rpc/ResponseMessage";
import SnakyConfig from "../SnakyConfig";
import {CommonMethodNames} from "./models/CommonMethodNames";
import EditReloadRequestParameter from "./models/EditReloadRequestParameter";
import GeneralSimInitializeRequestParams from "./models/GeneralSimInitializeRequestParams";
import GeneralSimInitializeResponseObject from "./models/GeneralSimInitializeResponseObject";
import SupportedFormatDescriptor from "./models/proposals/SupportedFormatDescriptor";
import SnakyComm from "./SnakyComm";

export default class SnakyClient extends JsonRpcClient {

    constructor(comm: SnakyComm) {
        super();
        this._comm = comm;
    }

    async sendSimInitializeRequest(): Promise<void> {
        const param0: GeneralSimInitializeRequestParams = {
            supported_formats: $supportedScoreFileFormats
        };

        const params: any[] = [param0];

        const responseMessage = await this.safeSendRequest(CommonMethodNames.generalSimInitialize, params);

        if (responseMessage === null) {
            console.error("RPC error!");
            return;
        }

        const result = responseMessage.result as GeneralSimInitializeResponseObject;

        if (util.isNullOrUndefined(result)) {
            console.error("RPC call errored. Info:", responseMessage.error);
            return;
        }

        if (util.isNullOrUndefined(result.selected_format)) {
            if (SnakyConfig.debug) {
                console.info("No common beatmap format.");
            }
        } else {
            if (SnakyConfig.debug) {
                console.info("Common beatmap format:", result.selected_format);
            }
        }
    }

    async sendPlayRequest(): Promise<ResponseMessage | null> {
        return this.safeSendRequest(CommonMethodNames.previewPlay);
    }

    async sendPauseRequest(): Promise<ResponseMessage | null> {
        return this.safeSendRequest(CommonMethodNames.previewPause);
    }

    async sendStopRequest(): Promise<ResponseMessage | null> {
        return this.safeSendRequest(CommonMethodNames.previewStop);
    }

    async sendReloadRequest(beatmapFile: string, backgroundMusicFile: string): Promise<void> {
        const param0: EditReloadRequestParameter = {
            beatmap_file: beatmapFile,
            beatmap_index: 0,
            beatmap_offset: 0,
            background_music_file: backgroundMusicFile
        };

        const params = [param0];

        const responseMessage = await this.safeSendRequest(CommonMethodNames.editReload, params);

        if (responseMessage === null) {
            console.error("RPC error!");
            return;
        }

        const result = responseMessage.result as GeneralSimInitializeResponseObject;

        if (util.isNullOrUndefined(result)) {
            console.error("RPC call errored. Info:", responseMessage.error);
            return;
        }
    }

    async sendEdExitedNotification(): Promise<void> {
        return this.safeSendNotification(CommonMethodNames.generalEdExited);
    }

    protected async safeSendRequest(method: string, params: any[] | object | null = null, id: string | number | null = null): Promise<ResponseMessage | null> {
        const uri = this._comm.simulatorServerUri;

        if (uri === null || uri === undefined) {
            vscode.window.showWarningMessage(nls.localize("snaky.warning.simulatorNotRunning", "No active simulator found."));
            return null;
        } else {
            return this.sendRequest(uri, method, params, id);
        }
    }

    protected async safeSendNotification(method: string, params: any[] | object | null = null): Promise<void> {
        const uri = this._comm.simulatorServerUri;

        if (uri === null || uri === undefined) {
            vscode.window.showWarningMessage(nls.localize("snaky.warning.simulatorNotRunning", "No active simulator found."));
            return;
        } else {
            return this.sendNotification(uri, method, params);
        }
    }

    private readonly _comm: SnakyComm;

}

const $supportedScoreFileFormats: SupportedFormatDescriptor[] = [
    {
        game: "arcaea",
        id: "aff",
        versions: [
            "*"
        ]
    },
    {
        game: "arcaea",
        id: "snaky",
        versions: [
            "*"
        ]
    }
];
