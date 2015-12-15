// Type definitions for gulp-autoprefixer
// Project: https://github.com/sindresorhus/gulp-autoprefixer
// Definitions by: Asana <https://asana.com>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts"/>

declare module "gulp-autoprefixer" {
    interface Options {
        browsers?: string[];
        cascade?: boolean;
        remove?: boolean;
    }

    interface Prefixer {
        (opts?: Options): NodeJS.ReadWriteStream;
    }

    var autoPrefixer: Prefixer;
    export = autoPrefixer;
}
