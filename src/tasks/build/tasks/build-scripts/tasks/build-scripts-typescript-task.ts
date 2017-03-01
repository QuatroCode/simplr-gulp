import TaskBase from '../../../../task-base';
import { DirectTypescriptBuilder } from "../../../../../builders/typescript/typescript-direct-builder";
import { LoggerInstance } from "../../../../../utils/logger";
import { TimePromise } from "../../../../../utils/helpers";

export default class BuildScriptsTask extends TaskBase {
    constructor() {
        super();
        this.Builder = new DirectTypescriptBuilder();
    }

    Name = "Build.Scripts.Typescript";
    Description = "Compiles TypeScript from source to build directory";

    protected Builder: DirectTypescriptBuilder;

    TaskFunction = async (production: boolean, done: () => void) => {
        await this.Build(production);

        // Indicate that compilation is done
        done();

        // And continue linting asynchronously
        await this.Lint(production);
    };

    protected async Build(production: boolean) {
        let logger = LoggerInstance.withType("Scripts.TypeScript");
        logger.info("Compiling...");
        let timedBuild = await TimePromise(() => this.Builder.Build(undefined, production, true));
        let diagnostics = timedBuild.Result;
        logger.info(`Compilation done in ${timedBuild.Elapsed}ms.`);
        this.Builder.PrintDiagnostics(diagnostics, LoggerInstance, production);
    }

    protected async Lint(production: boolean) {
        let logger = LoggerInstance.withType("Scripts.TypeScript");
        logger.info("Async linting...");
        let timedLint = await TimePromise(() => this.Builder.LintAll(production));
        let lintResults = timedLint.Result;
        logger.info(`Linting done in ${timedLint.Elapsed}ms.`);
        this.Builder.PrintLintResults(lintResults, LoggerInstance, production);
    }
}
