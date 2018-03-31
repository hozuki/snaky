"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaValidator_1 = require("../SchemaValidator");
const requestSchema = require("./jsonrpc-request-schema.json");
const responseSchema = require("./jsonrpc-response-schema.json");
class JsonRpcHelper {
    static isRequestValid(obj) {
        if (obj === null) {
            return false;
        }
        return SchemaValidator_1.default.validate(obj, requestSchema);
    }
    static isResponseValid(obj) {
        if (obj === null) {
            return false;
        }
        return SchemaValidator_1.default.validate(obj, responseSchema);
    }
}
exports.default = JsonRpcHelper;
//# sourceMappingURL=JsonRpcHelper.js.map