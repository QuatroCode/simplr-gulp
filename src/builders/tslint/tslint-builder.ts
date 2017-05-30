import * as gulp from "gulp";
import { BuilderBase } from "../builder-base";
import tslint from "gulp-tslint";
import { TsLintFormatter } from "./tslint-formatter";
import { Paths } from "../../paths/paths";
import * as cache from "gulp-cached";
import { LoggerInstance } from "../../utils/logger";

export class TslintBuilder extends BuilderBase<void> {
    protected build(production: boolean, builder: void, done: () => void) {
        
        gulp.src([
                Paths.Builders.AllFiles.InSourceApp(".ts*"),
                `!${Paths.Builders.AllFiles.InSourceApp("d.ts")}`
            ])
            .pipe(cache("scripts.tslint"))
            .pipe(tslint({
                formatter: TsLintFormatter
            }))
            .on("end", done);
    }

    protected initBuilder(production: boolean) {
        const { Linter } = require("tslint");
        LoggerInstance.withType("TSLint").info(`Using TSLint@${Linter.VERSION}`);
        return;
    }

}
