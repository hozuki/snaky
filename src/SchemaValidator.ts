import * as Ajv from "ajv";

const ajvOptions: Ajv.Options = {
    jsonPointers: true
};

const $ajv = new Ajv(ajvOptions);
const cachedSchemas: Map<object, Ajv.ValidateFunction> = new Map();

export default abstract class SchemaValidator {

    static get ajv(): Ajv.Ajv {
        return $ajv;
    }

    static validate(object: any, schema: object): boolean {
        let validator: Ajv.ValidateFunction;

        if (cachedSchemas.has(schema)) {
            validator = cachedSchemas.get(schema) as Ajv.ValidateFunction;
        } else {
            validator = $ajv.compile(schema);
            cachedSchemas.set(schema, validator);
        }

        return !!validator(object);
    }

    static detailedValidate(object: any, schema: object): SingleValidationResult {
        let validator: Ajv.ValidateFunction;

        if (cachedSchemas.has(schema)) {
            validator = cachedSchemas.get(schema) as Ajv.ValidateFunction;
        } else {
            validator = $ajv.compile(schema);
            cachedSchemas.set(schema, validator);
        }

        const valid = !!validator(object);
        const errors = valid ? [] : validator.errors as Ajv.ErrorObject[];

        return {
            valid,
            errors
        };
    }

}

interface SingleValidationResult {

    valid: boolean;
    errors: Ajv.ErrorObject[];

}
