import SchemaValidator from "../SchemaValidator";
import * as requestSchema from "./jsonrpc-request-schema.json";
import * as responseSchema from "./jsonrpc-response-schema.json";

export default abstract class JsonRpcHelper {

    static isRequestValid(obj: object | null): boolean {
        if (obj === null) {
            return false;
        }

        return SchemaValidator.validate(obj, requestSchema);
    }

    static isResponseValid(obj: object | null): boolean {
        if (obj === null) {
            return false;
        }

        return SchemaValidator.validate(obj, responseSchema);
    }

}


