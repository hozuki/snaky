export default interface EditReloadRequestParameter {
    // Path to the beatmap document file.
    beatmap_file: string;
    // Index of the actual beatmap, if there are multiple beatmaps in one document.
    beatmap_index: number;
    // Extra offset for previewing, in seconds.
    beatmap_offset: number;

    // # Extensions; there may be other extensions.

    // Path to the background music file.
    background_music_file?: string;
    // Path to the background video file.
    background_video_file?: string;
}
