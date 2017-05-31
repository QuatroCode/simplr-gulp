import * as gulp from "gulp";
import { BuilderBase } from "../builder-base";
import gulpTsLint from "gulp-tslint";
import * as tslint from "tslint";
import { TsLintFormatter } from "./tslint-formatter";
import { Paths } from "../../paths/paths";
import * as cache from "gulp-cached";
import { LoggerInstance } from "../../utils/logger";
// import { TypescriptBuilder } from "../typescript/typescript-builder";
import { Configuration } from "../../configuration/configuration";
import * as ts from "typescript";

export class TslintBuilder extends BuilderBase<ts.Program> {
    protected build(production: boolean, builder: ts.Program, done: () => void) {
        gulp.src([
            Paths.Builders.AllFiles.InSourceApp(".ts*"),
            `!${Paths.Builders.AllFiles.InSourceApp("d.ts")}`
        ])
            .pipe(cache("scripts.tslint"))
            .pipe(gulpTsLint({
                formatter: TsLintFormatter,
                program: builder
            }))
            .on("end", done);
    }

    protected initBuilder(production: boolean): ts.Program {
        LoggerInstance.withType("TSLint").info(`Using TSLint@${tslint.Linter.VERSION}`);
        let configurationFile: string;
        if (production) {
            configurationFile = Configuration.GulpConfig.TypeScriptConfig.Production;
        } else {
            configurationFile = Configuration.GulpConfig.TypeScriptConfig.Development;
        }
        return tslint.Linter.createProgram(configurationFile);
    }

}
