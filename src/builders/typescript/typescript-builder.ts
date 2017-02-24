import BuilderBase from '../builder-base';
import Configuration from '../../configuration/configuration';
import * as gulp from 'gulp';
import * as path from 'path';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';
import * as sourcemaps from 'gulp-sourcemaps';
import TypescriptBuilderCompiler from './typescript-builder-compiler';
import Logger from '../../utils/logger';


class Reporter implements ts.Reporter {
    error(error: any) {
        if (error.tsFile) {
            let fileName = error.relativeFilename || error.tsFile.fileName;
            fileName = path.normalize(fileName);

            let messageText = (typeof error.diagnostic.messageText === "string") ? error.diagnostic.messageText : error.diagnostic.messageText.messageText;

            Logger.withType("TS").error(`${fileName}[${error.startPosition.line}, ${error.startPosition.character}]: `, messageText);
        } else {
            Logger.withType("TS").error(error.message);
        }
    }
}

class TypescriptBuilder extends BuilderBase<TypescriptBuilderCompiler> {

    private reporter = new Reporter();

    protected build(production: boolean, builder: TypescriptBuilderCompiler, done: () => void) {

        let tsResult = builder.Project.src();

        if (!production) {
            tsResult = tsResult.pipe(sourcemaps.init());
        }

        tsResult = tsResult.pipe((builder.Project as any)(this.reporter)).js;

        tsResult
            .pipe((production) ? uglify({ mangle: true }) : sourcemaps.write())
            .pipe(gulp.dest(builder.Config.OutDir))
            .on("end", done);
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