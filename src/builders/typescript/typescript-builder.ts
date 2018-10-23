import { BuilderBase } from "../builder-base";
import { Configuration } from "../../configuration/configuration";
import * as gulp from "gulp";
import * as uglify from "gulp-uglify";
import * as sourcemaps from "gulp-sourcemaps";
import { TypescriptBuilderCompiler } from "./typescript-builder-compiler";
import * as cache from "gulp-cached";
import { Reporter } from "./typescript-reporter";

class TypescriptBuilderClass extends BuilderBase<TypescriptBuilderCompiler> {

    private reporter = new Reporter();

    protected build(production: boolean, builder: TypescriptBuilderCompiler, done: () => void) {

        let tsResult = builder.Project
            .src()
            .pipe(cache("scripts.typescript"));

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

    public GetBuilder(production: boolean) {
        return this.getBuilder(production);
    }

    // private get directories() {
    //     return Configuration.GulpConfig.Directories;
    // }

    private get typescriptConfig() {
        return Configuration.GulpConfig.TypeScriptConfig;
    }
}

export const TypescriptBuilder = new TypescriptBuilderClass();
