"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const ajvOptions = {
    jsonPointers: true
};
const $ajv = new Ajv(ajvOptions);
const cachedSchemas = new Map();
class SchemaValidator {
    static get ajv() {
        return $ajv;
    }
    static validate(object, schema) {
        let validator;
        if (cachedSchemas.has(schema)) {
            validator = cachedSchemas.get(schema);
        }
        else {
            validator = $ajv.compile(schema);
            cachedSchemas.set(schema, validator);
        }
        return !!validator(object);
    }
    static detailedValidate(object, schema) {
        let validator;
        if (cachedSchemas.has(schema)) {
            validator = cachedSchemas.get(schema);
        }
        else {
            validator = $ajv.compile(schema);
            cachedSchemas.set(schema, validator);
        }
        const valid = !!validator(object);
        const errors = valid ? [] : validator.errors;
        return {
            valid,
            errors
        };
    }
}
exports.default = SchemaValidator;
//# sourceMappingURL=SchemaValidator.js.map