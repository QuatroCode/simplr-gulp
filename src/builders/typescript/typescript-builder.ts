import BuilderBase from '../builder-base';
import Configuration from '../../configuration/configuration';
import Paths from '../../paths/paths';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';

import TypescriptBuilderCompiler from './typescript-builder-compiler';

class TypescriptBuilder extends BuilderBase<TypescriptBuilderCompiler> {

    protected build(production: boolean, builder: TypescriptBuilderCompiler, done: () => void) {
        let tsResult = gulp.src(Paths.Builders.AllFiles.InSource())
            .pipe(ts(builder.Project)).js;

        if (production) {
            tsResult = tsResult.pipe(uglify({ mangle: true }));
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