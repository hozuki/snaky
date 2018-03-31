import Abstract from "./Abstract";

/**
 * Ensure that the annotated method is an override, not a new definition.
 * In order to make this annotation work correctly, abstract classes should be annotated with {@see Abstract}.
 * @returns {Function} Annotation applier.
 * @constructor
 */
function Override(): Function {
    return (classPrototype: Function, propertyKey: string): void => {
        let proto = Object.getPrototypeOf(classPrototype);

        if (proto && proto !== Object.prototype) {
            // Check for direct inheritance from an abstract class.
            if (Object.hasOwnProperty.call(proto, Abstract.symbol)) {
                return;
            }
        }

        while (proto && proto !== Object.prototype) {
            if (Object.hasOwnProperty.call(proto, propertyKey)) {
                return;
            }

            proto = Object.getPrototypeOf(proto);
        }

        let functionName = classPrototype.constructor ? classPrototype.constructor.name : null;

        if (!functionName) {
            functionName = "(anonymous)";
        } else if (typeof(functionName) !== "string") {
            functionName = "(renamed)";
        }

        throw new TypeError(`'${functionName}.${propertyKey}' is annotated as method override (@Override), but it does not override any base class method.`);
    };
}

export default Override;