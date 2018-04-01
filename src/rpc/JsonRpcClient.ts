import * as requestPromise from "request-promise-native";
import {BvspConstants} from "../BvspConstants";
import JsonRpc from "./JsonRpc";
import JsonRpcHelper from "./JsonRpcHelper";
import RequestMessage from "./RequestMessage";
import ResponseMessage from "./ResponseMessage";

export default class JsonRpcClient {

    async sendRequest(uri: string, method: string, params: any[] | object | null = null, id: string | number | null = null): Promise<ResponseMessage> {
        const options = prepareRequest(method, true, params, id);
        const responseBody: string = await requestPromise.post(uri, options);

        if (JsonRpc.debug) {
            console.debug(`Sent RPC command "${method}" to server '${uri}'; type = request`);
        }

        let responseObj;

        try {
            responseObj = JSON.parse(responseBody);
        } catch (ex) {
            return Promise.reject(ex);
        }

        if (!JsonRpcHelper.isResponseValid(responseObj)) {
            throw new TypeError("The HTTP body is not a valid JSON RPC 2.0 response object");
        }

        return responseObj as ResponseMessage;
    }

    async sendNotification(uri: string, method: string, params: any[] | object | null): Promise<void> {
        const options = prepareRequest(method, false, params);
        await requestPromise.post(uri, options);

        if (JsonRpc.debug) {
            console.debug(`Sent RPC command "${method}" to server '${uri}'; type = notification`);
        }
    }

}

function prepareRequest(rpcMethod: string, requiresID: boolean, params: any[] | object | null, id?: string | number | null): requestPromise.RequestPromiseOptions {
    const options: requestPromise.RequestPromiseOptions = Object.create(null);

    options.resolveWithFullResponse = true;

    if (params === undefined || params === null) {
        params = [];
    }

    const requestObject: RequestMessage = {
        jsonrpc: "2.0",
        method: rpcMethod,
        params: params
    };

    if (requiresID) {
        requestObject.id = id;
    }

    const requestBody = JSON.stringify(requestObject);

    options.body = requestBody;

    options.headers = {
        "Content-Type": BvspConstants.contentType,
        "Content-Length": requestBody.length.toString()
    };

    return options;
}