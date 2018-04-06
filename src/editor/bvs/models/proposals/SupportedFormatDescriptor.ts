export default interface SupportedFormatDescriptor {
    // Game ID
    game: string;
    // Format ID
    id: string;
    // Format version list
    versions: string[];
    // Extra info
    extra?: any;
}
