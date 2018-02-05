import * as gulp from "gulp";
import * as sass from "gulp-sass";
import * as autoprefixer from "gulp-autoprefixer";
import * as cleanCSS from "gulp-clean-css";
import * as sourcemaps from "gulp-sourcemaps";
import { Duplex } from "stream";
import * as cache from "gulp-cached";

import { BuilderBase } from "../builder-base";
import Paths from "../../paths/paths";
import { LoggerInstance } from "../../utils/logger";

//TODO: Temporary solution for this interface
interface ErrorDto {
    formatted?: string;
    column?: number;
    line?: number;
    file?: string;
    status?: number;
    messageFormatted?: string;
    messageOriginal?: string;
    relativePath?: string;
    name?: string;
    stack?: string;
    showStack?: boolean;
    showProperties?: boolean;
    plugin?: string;
}

export class StylesBuilder extends BuilderBase<undefined> {
    protected build(
        production: boolean,
        builder: undefined,
        done: () => void
    ): void {
        let sassResults: Duplex | NodeJS.ReadWriteStream = gulp
            .src(Paths.Builders.AllFiles.InSourceApp(".scss"))
            .pipe(cache("styles"));

        if (!production) {
            sassResults = sassResults.pipe(sourcemaps.init());
        }

        sassResults = sassResults.pipe(
            sass().on("error", (error: ErrorDto) => {
                this.errorHandler(error);
                done();
            })
        );

        sassResults = sassResults.pipe(autoprefixer());

        if (!production) {
            sassResults = sassResults.pipe(sourcemaps.write());
        } else {
            sassResults = sassResults.pipe(
                cleanCSS({ processImportFrom: ["local"] })
            );
        }

        sassResults.pipe(gulp.dest(Paths.Directories.BuildApp)).on("end", done);
    }

    private errorHandler(error: ErrorDto): void {
        if (error != null) {
            if (
                error.relativePath != null &&
                error.line != null &&
                error.column != null &&
                error.messageOriginal != null
            ) {
                LoggerInstance.withType("SCSS").error(
                    `${error.relativePath}[${error.line}, ${error.column}]: ${
                        error.messageOriginal
                    }`
                );
            } else {
                LoggerInstance.error("Error in 'gulp-sass' plugin: \n", error);
            }
        } else {
            LoggerInstance.error(`Unknown error in 'gulp-sass' plugin.`);
        }
    }

    protected initBuilder(production: boolean): undefined {
        return undefined;
    }
}
