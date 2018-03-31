declare module "string-argv" {

    const value: StringArgV;
    export = value;

}

declare interface StringArgV {

    (arguments: string, environment?: string, file?: string): string[];

    // Legacy
    parseArgsStringToArgv(arguments: string, environment?: string, file?: string): string[];

}