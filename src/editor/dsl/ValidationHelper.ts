import * as util from "util";
import ValidationMode from "./ValidationMode";

export default abstract class ValidationHelper {

    static parseValidationMode(s: string | null | undefined): ValidationMode {
        if (util.isString(s)) {
            s = s.trim().toLowerCase();
        } else {
            s = "normal";
        }

        switch (s) {
            case "normal":
                return ValidationMode.Normal;
            case "strict":
                return ValidationMode.Strict;
            case "treataserror":
            case "treat_as_error":
                return ValidationMode.TreatAsError;
            default:
                throw new TypeError("Unexpected value: " + s);
        }
    }

}
