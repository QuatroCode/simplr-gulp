// Type definitions for gulp-replace
// Project: https://github.com/lazd/gulp-replace
// Definitions by: Asana <https://asana.com>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts"/>

declare namespace GulpReplace {
    interface Options {
        skipBinary?: boolean;
    }

    interface Replacer {
      (match: string): string
    }

    export interface replace {
        (pattern: string, replacement: string | Replacer, opts?: Options): NodeJS.ReadWriteStream;
        (pattern: RegExp, replacement: string | Replacer, opts?: Options): NodeJS.ReadWriteStream;
    }        
}

declare module "gulp-replace" {
    var replace: GulpReplace.replace;
    export = replace;
}