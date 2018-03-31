import * as http from "http";
import * as HttpStatusCode from "http-status-codes";
import {BvspConstants} from "../BvspConstants";
import {JsonRpcErrorCodes} from "./JsonRpcErrorCodes";
import ResponseError from "./ResponseError";
import ResponseMessage from "./ResponseMessage";

const serverSignature = "Node Server for BVSP";

export default class ServerHttpContext {

    constructor(request: http.IncomingMessage, response: http.ServerResponse) {
        this._request = request;
        this._response = response;
    }

    get request(): http.IncomingMessage {
        return this._request;
    }

    get response(): http.ServerResponse {
        return this._response;
    }

    async respond(code: number, body?: string): Promise<void> {
        this.response.statusCode = code;
        this.response.statusMessage = HttpStatusCode.getStatusText(code);

        const currentDate = new Date();

        const headers: any = {
            "X-Server": serverSignature,
            "Date": currentDate.toUTCString(),
            "Content-Type": BvspConstants.contentType
        };

        if (body !== undefined) {
            const buffer = new Buffer(body);
            headers["Content-Length"] = buffer.length;
        }

        this.response.writeHead(this.response.statusCode, this.response.statusMessage, headers);

        if (body !== undefined && body !== null) {
            this.response.write(body);
        }

        this.response.end();
    }

    async ok(body?: string): Promise<void> {
        return this.respond(HttpStatusCode.OK, body);
    }

    async rpcOk(result: any, id?: string | number | null): Promise<void> {
        const responseMessage: ResponseMessage = {
            jsonrpc: "2.0",
            result: result
        };

        if (id !== undefined) {
            responseMessage.id = id;
        }

        const responseBodyText = JSON.stringify(responseMessage);

        return this.ok(responseBodyText);
    }

    async rpcError(httpCode: number, rpcCode: number, rpcMessage: string, id?: string | number | null, rpcErrorData?: any): Promise<void> {
        const errorObject: ResponseError = {
            code: rpcCode,
            message: rpcMessage
        };

        if (rpcErrorData !== undefined) {
            errorObject.data = rpcErrorData;
        }

        const responseMessage: ResponseMessage = {
            jsonrpc: "2.0",
            error: errorObject
        };

        if (id !== undefined) {
            responseMessage.id = id;
        }

        const responseBodyText = JSON.stringify(responseMessage);

        return this.respond(httpCode, responseBodyText);
    }

    async rpcNotImplemented(id?: string | number | null): Promise<void> {
        return this.rpcError(HttpStatusCode.INTERNAL_SERVER_ERROR, JsonRpcErrorCodes.InternalError, "Method not implemented", id);
    }

    private _request: http.IncomingMessage;
    private _response: http.ServerResponse;

}
