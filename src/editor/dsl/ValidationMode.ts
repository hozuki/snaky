/**
 * Validation mode for AFF and Snaky.
 */
const enum ValidationMode {

    /**
     * Normal mode, which is the same as the game uses.
     * @type {number}
     */
    Normal = 0,
    /**
     * Strict mode. It is a little stricter than the game, but it helps highlight out some common invalid beatmap styles.
     * @type {number}
     */
    Strict = 1,
    /**
     * Treat all warnings as error.
     * @type {number}
     */
    TreatAsError = 10

}

export default ValidationMode;
