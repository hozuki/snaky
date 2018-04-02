/**
 * Snaky config object. Its contents stores in "snaky.json" in the workspace directory.
 */
export default interface SnakyWorkspaceConfigFile {

    /**
     * Path to the executable file of the simulator.
     */
    simExe: string;
    /**
     * Command line arguments used when launching the simulator.
     */
    simArgs: string;
    /**
     * The display name of the simulator.
     */
    simName: string;

}
