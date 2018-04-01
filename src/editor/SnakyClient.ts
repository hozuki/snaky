import * as vscode from "vscode";
import * as nls from "../Nls";
import JsonRpcClient from "../rpc/JsonRpcClient";
import ResponseMessage from "../rpc/ResponseMessage";
import {CommonMethodNames} from "./bvs/CommonMethodNames";
import EditReloadRequestParameter from "./bvs/EditReloadRequestParameter";
import SnakyComm from "./SnakyComm";

export default class SnakyClient extends JsonRpcClient {

    constructor(comm: SnakyComm) {
        super();
        this._comm = comm;
    }

    async sendSimInitializeRequest(): Promise<ResponseMessage | null> {
        const params: any[] = [];

        return this.safeSendRequest(CommonMethodNames.generalSimInitialize, params);
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

    async sendReloadRequest(beatmapFile: string, beatmapIndex: number, beatmapOffset: number, backgroundMusicFile: string): Promise<ResponseMessage | null> {
        const p1: EditReloadRequestParameter = {
            beatmap_file: beatmapFile,
            beatmap_index: beatmapIndex,
            beatmap_offset: beatmapOffset,
            background_music_file: backgroundMusicFile
        };

        const params = [p1];

        return this.safeSendRequest(CommonMethodNames.editReload, params);
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