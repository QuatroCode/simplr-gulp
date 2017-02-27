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

    TaskFunction = (production: boolean, done: () => void) => {
        return new Promise(async (resolve, reject) => {
            let logger = LoggerInstance.withType("Scripts.TypeScript");
            logger.info("Compiling...");
            let timedBuild = await TimePromise(() => this.Builder.Build(undefined, production, true));
            let diagnostics = timedBuild.Result;
            logger.info(`Compilation done in ${timedBuild.Elapsed}ms.`);
            this.Builder.PrintDiagnostics(diagnostics, LoggerInstance);

            // Indicate that compilation is done
            done();

            // And continue linting asynchronously
            logger.info("Async linting...");
            let timedLint = await TimePromise(() => this.Builder.LintAll(production));
            let lintResults = timedLint.Result;
            logger.info(`Linting done in ${timedLint.Elapsed}ms.`);
            this.Builder.PrintLintResults(lintResults, LoggerInstance);
        });
    };
}
