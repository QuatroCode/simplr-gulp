import BuilderBase from '../builder-base';
import Configuration from '../../configuration/configuration';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';
import * as sourcemaps from 'gulp-sourcemaps';
import * as filter from 'gulp-filter';
import tslint from 'gulp-tslint';
import TsLintFormatter from './tslint/tslint-formatter';
import TypescriptBuilderCompiler from './typescript-builder-compiler';
import Logger from '../../utils/logger';


class Reporter implements ts.Reporter {
    error(error: any) {
        if (error.tsFile) {
            Logger.withType("TS").error(`${error.relativeFilename}[${error.startPosition.line}, ${error.startPosition.character}]: `, error.diagnostic.messageText);
        } else {
            Logger.withType("TS").error(error.message);
        }
    }
}

class TypescriptBuilder extends BuilderBase<TypescriptBuilderCompiler> {

    private reporter = new Reporter();

    protected build(production: boolean, builder: TypescriptBuilderCompiler, done: () => void) {

        let dTsFilter = filter(["*", "!**/*.d.ts"], { restore: true });
        let tsResult = gulp.src(builder.Config.Src)
            .pipe(dTsFilter)
            .pipe(tslint({
                formatter: TsLintFormatter
            }))
            .pipe(dTsFilter.restore)
            .pipe(ts(builder.Project, undefined, this.reporter)).js;

        if (production) {
            tsResult = tsResult.pipe(uglify({ mangle: true }));
        } else {
            tsResult = tsResult.pipe(sourcemaps.init()).pipe(sourcemaps.write());
        }
        tsResult.pipe(gulp.dest(builder.Config.OutDir)).on("end", done);
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