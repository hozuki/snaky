"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestPromise = require("request-promise-native");
const BvspConstants_1 = require("../BvspConstants");
const JsonRpc_1 = require("./JsonRpc");
const JsonRpcHelper_1 = require("./JsonRpcHelper");
class JsonRpcClient {
    sendRequest(uri, method, params = null, id = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = prepareRequest(method, true, params, id);
            const responseBody = yield requestPromise.post(uri, options);
            if (JsonRpc_1.default.debug) {
                console.debug(`Sent RPC command "${method}" to server '${uri}'; type = request`);
            }
            let responseObj;
            try {
                responseObj = JSON.parse(responseBody);
            }
            catch (ex) {
                return Promise.reject(ex);
            }
            if (!JsonRpcHelper_1.default.isResponseValid(responseObj)) {
                throw new TypeError("The HTTP body is not a valid JSON RPC 2.0 response object");
            }
            return responseObj;
        });
    }
    sendNotification(uri, method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = prepareRequest(method, false, params);
            yield requestPromise.post(uri, options);
            if (JsonRpc_1.default.debug) {
                console.debug(`Sent RPC command "${method}" to server '${uri}'; type = notification`);
            }
        });
    }
}
exports.default = JsonRpcClient;
function prepareRequest(rpcMethod, requiresID, params, id) {
    const options = Object.create(null);
    options.resolveWithFullResponse = true;
    if (params === undefined || params === null) {
        params = [];
    }
    const requestObject = {
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
        "Content-Type": BvspConstants_1.BvspConstants.contentType,
        "Content-Length": requestBody.length.toString()
    };
    return options;
}
//# sourceMappingURL=JsonRpcClient.js.map