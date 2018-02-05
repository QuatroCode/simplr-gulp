import * as gulp from "gulp";
import * as uglify from "gulp-uglify";

import { TaskBase } from "../../../../task-base";
import { DirectTypescriptBuilder } from "../../../../../builders/typescript/typescript-direct-builder";
import { LoggerInstance } from "../../../../../utils/logger";
import { TimePromise } from "../../../../../utils/helpers";

export class BuildScriptsTask extends TaskBase {
    constructor() {
        super();
        this.Builder = new DirectTypescriptBuilder(LoggerInstance);
    }

    public Name: string = "Build.Scripts.Typescript";
    public Description: string = "Compiles TypeScript from source to build directory";

    protected Builder: DirectTypescriptBuilder;

    public TaskFunction = async (production: boolean, done: () => void) => {
        await this.Build(production);

        if (production) {
            await this.Uglify(production);
        }

        // Indicate that compilation is done
        done();

        // And continue linting asynchronously
        await this.Lint(production);
    };

    protected async Build(production: boolean): Promise<void> {
        const logger = LoggerInstance.withType("Scripts.TypeScript");
        logger.info("Compiling...");
        const timedBuild = await TimePromise(() => this.Builder.Build(undefined, production, true));
        const diagnostics = timedBuild.Result;
        logger.info(`Compilation done in ${timedBuild.Elapsed}ms.`);
        this.Builder.PrintDiagnostics(diagnostics, LoggerInstance, production);
    }

    protected async Lint(production: boolean): Promise<void> {
        const logger = LoggerInstance.withType("Scripts.TypeScript");
        logger.info("Async linting...");
        const timedLint = await TimePromise(() => this.Builder.LintAll(production));
        const lintResults = timedLint.Result;
        logger.info(`Linting done in ${timedLint.Elapsed}ms.`);
        this.Builder.PrintLintResults(lintResults, LoggerInstance, production);
    }

    protected Uglify(production: boolean): Promise<{}> {
        return new Promise(resolve => {
            const logger = LoggerInstance.withType("Scripts.TypeScript");
            logger.info("Uglifying...");
            const start = +new Date();
            const tsConfig = this.Builder.LoadTsConfig(production);
            const jsFilesPattern = `${tsConfig.compilerOptions.outDir}/**/*.js`;
            gulp
                .src(jsFilesPattern)
                .pipe(uglify({ mangle: true }))
                .pipe(gulp.dest(tsConfig.compilerOptions.outDir))
                .on("end", () => {
                    logger.info(`Uglifying done in ${+new Date() - start}ms.`);
                    resolve();
                });
        });
    }
}
