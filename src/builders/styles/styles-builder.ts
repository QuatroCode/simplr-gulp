import BuilderBase from '../builder-base';
import Paths from '../../paths/paths';
import * as gulp from 'gulp';
import * as cleanCSS from 'gulp-clean-css';
import * as sass from 'gulp-sass';
import * as sourcemaps from 'gulp-sourcemaps';
import Logger from '../../utils/logger';
import { Duplex } from 'stream';

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

class StylesBuilder extends BuilderBase<null> {


    protected build(production: boolean, builder: null, done: () => void) {

        let sassResults: Duplex | NodeJS.ReadWriteStream = gulp.src(Paths.Builders.AllFiles.InSourceApp(".scss"));

        if (!production) {
            sassResults = sassResults.pipe(sourcemaps.init());
        }

        sassResults = sassResults
            .pipe(sass()
                .on('error', (error: ErrorDto) => {
                    this.errorHandler(error);
                    done();
                })
            );

        if (!production) {
            sassResults = sassResults.pipe(sourcemaps.write());
        } else {
            sassResults = sassResults.pipe(cleanCSS());
        }

        sassResults.pipe(gulp.dest(Paths.Directories.BuildApp))
            .on('end', done);
    }

    private errorHandler(error: ErrorDto) {
        if (error != null) {
            if (error.relativePath != null && error.line != null && error.column != null && error.messageOriginal != null) {
                Logger.withType("SCSS").error(`${error.relativePath}[${error.line}, ${error.column}]: ${error.messageOriginal}`);
            } else {
                Logger.error("Error in 'gulp-sass' plugin: \n", error);
            }
        } else {
            Logger.error(`Unknown error in 'gulp-sass' plugin.`);
        }
    }

    protected initBuilder(production: boolean) {
        return null;
    }
}

export default new StylesBuilder();
