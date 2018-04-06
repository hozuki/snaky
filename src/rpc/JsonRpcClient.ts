import * as http from "http";
import * as util from "util";
import * as vscode from "vscode";
import {BvspConstants} from "../BvspConstants";
import JsonRpc from "./JsonRpc";
import RequestMessage from "./RequestMessage";
import ResponseMessage from "./ResponseMessage";

export default class JsonRpcClient {

    async sendRequest(uri: string, method: string, params: any[] | object | null = null, id: string | number | null = null): Promise<ResponseMessage> {
        const options = prepareRequestOptions(uri);
        const body = prepareRequestBody(options, method, true, params, id);

        if (JsonRpc.debug) {
            console.debug(`Sent RPC command "${method}" to server '${uri}'; type = request`);
        }

        const responseBody = await getResponseBody(options, body);

        if (JsonRpc.debug) {
            console.debug("Received:", responseBody);
        }

        let responseObj;

        try {
            responseObj = JSON.parse(responseBody);
        } catch (ex) {
            return Promise.reject(ex);
        }

        // TODO: AJV doesn't support validating this either...
        // if (!JsonRpcHelper.isResponseValid(responseObj)) {
        //     throw new TypeError("The HTTP body is not a valid JSON RPC 2.0 response object");
        // }

        return responseObj as ResponseMessage;
    }

    async sendNotification(uri: string, method: string, params: any[] | object | null): Promise<void> {
        const options = prepareRequestOptions(uri);
        const body = prepareRequestBody(options, method, false, params);

        getResponseBody(options, body);

        if (JsonRpc.debug) {
            console.debug(`Sent RPC command "${method}" to server '${uri}'; type = notification`);
        }
    }

}

async function getResponseBody(options: http.RequestOptions, requestBody?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const request = http.request(options, responseMessage => {
            responseMessage.setEncoding("utf-8");

            let responseBody = "";

            responseMessage.on("data", chunk => {
                responseBody += chunk;
            });

            responseMessage.on("end", () => {
                resolve(responseBody);
            });

            responseMessage.on("error", reject);
        });

        request.on("error", reject);

        if (!util.isUndefined(requestBody)) {
            request.write(requestBody);
        }

        request.end();
    });
}

function prepareRequestOptions(uri: string): http.RequestOptions {
    const uriObject = vscode.Uri.parse(uri);

    const options: http.RequestOptions = Object.create(null);

    if (uriObject.authority.indexOf(":") >= 0) {
        const hostAndPort = uriObject.authority.split(":");
        options.hostname = hostAndPort[0];
        options.port = Number.parseInt(hostAndPort[1]);
    } else {
        options.hostname = uriObject.authority;
    }

    options.path = uriObject.path;
    options.protocol = uriObject.scheme + ":";
    options.method = "POST";

    options.headers = {
        "content-type": BvspConstants.contentType
    };

    return options;
}

function prepareRequestBody(options: http.RequestOptions, rpcMethod: string, requiresID: boolean, params: any[] | object | null, id?: string | number | null): string {
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

    const buf = new Buffer(requestBody, "utf-8");

    options.headers!["content-length"] = buf.byteLength.toString();

    return requestBody;
}