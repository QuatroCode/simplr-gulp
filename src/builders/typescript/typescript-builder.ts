import BuilderBase from '../builder-base';
import Configuration from '../../configuration/configuration';
import Paths from '../../paths/paths';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';
import * as sourcemaps from 'gulp-sourcemaps';
import tslint from 'gulp-tslint';
import TsLintFormatter from './tslint/tslint-formatter';
import TypescriptBuilderCompiler from './typescript-builder-compiler';
import Logger from '../../utils/logger';


class Reporter implements ts.Reporter {
    error(error: any) {
        Logger.withType("TS").error(`${error.relativeFilename}[${error.startPosition.line}, ${error.startPosition.character}]: ${error.diagnostic.messageText}`);
    }
}

class TypescriptBuilder extends BuilderBase<TypescriptBuilderCompiler> {

    private reporter = new Reporter();

    protected build(production: boolean, builder: TypescriptBuilderCompiler, done: () => void) {

        let tsResult = gulp.src(Paths.Builders.AllFiles.InSource(".{ts,tsx}"))
            .pipe(tslint({
                formatter: TsLintFormatter
            }))
            .pipe(ts(builder.Project, undefined, this.reporter)).js;

        if (production) {
            tsResult = tsResult.pipe(uglify({ mangle: true }));
        } else {
            tsResult = tsResult.pipe(sourcemaps.init()).pipe(sourcemaps.write());
        }

        tsResult.pipe(gulp.dest(Paths.Directories.Build)).on("end", done);
    }

    protected initBuilder(production: boolean) {
        if (production) {
            return new TypescriptBuilderCompiler(this.typescriptConfig.Production);
        } else {
            return new TypescriptBuilderCompiler(this.typescriptConfig.Development);
        }
    }

    private get directories() {
        return Configuration.GulpConfig.Directories;
    }

    private get typescriptConfig() {
        return Configuration.GulpConfig.TypeScriptConfig;
    }
}

export default new TypescriptBuilder();