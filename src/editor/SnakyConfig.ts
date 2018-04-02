const $debug = true;

export default abstract class SnakyConfig {

    /**
     * Gets whether debug mode is on.
     * @returns {boolean} {@see true} if debug mode is on, otherwise {@see false}.
     */
    static get debug(): boolean {
        return $debug;
    }

}