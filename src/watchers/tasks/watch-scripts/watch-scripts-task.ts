import WatchTaskBase from "../../watcher-task-base";
import Paths from "../../../paths/paths";
import * as fs from "fs";
import { LoggerInstance } from "../../../utils/logger";
import { DirectTypescriptBuilder } from "../../../builders/typescript/typescript-direct-builder";
import { TimePromise, TimedPromiseResult } from "../../../utils/helpers";
import { LintResult } from "tslint/lib/lint";


export default class WatchScriptsTask extends WatchTaskBase {
    Builder: DirectTypescriptBuilder;
    /**
     *
     */
    constructor() {
        super();
        this.Builder = new DirectTypescriptBuilder();
        this.Builder.PrintTypescriptVersion(LoggerInstance);
    }

    TaskNamePrefix = "Build";
    Name = "Scripts";

    Globs = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

    protected UseWatchTaskFunctionOnly = true;

    private changedFile: { Name: string, Stats: fs.Stats };

    protected WatchTaskFunction = (production: boolean) => {
        return new Promise(async (resolve, reject) => {
            let logger = LoggerInstance.withType("Scripts");
            logger.info("Compiling...");
            let timedBuild = await TimePromise(() => this.Builder.Build([this.changedFile.Name], production, !this.buildSingleFile));
            let diagnostics = timedBuild.Result;
            logger.info(`Compilation done in ${timedBuild.Elapsed}ms.`);
            this.Builder.PrintDiagnostics(diagnostics, LoggerInstance, production);

            logger.info("Linting...");
            let timedLint: TimedPromiseResult<LintResult[]>;
            if (this.buildSingleFile) {
                timedLint = await TimePromise(() => this.Builder.Lint([this.changedFile.Name]));
            } else {
                timedLint = await TimePromise(() => this.Builder.LintAll(production));
            }
            let lintResults = timedLint.Result;
            logger.info(`Linting done in ${timedLint.Elapsed}ms.`);
            this.Builder.PrintLintResults(lintResults, LoggerInstance, production);

            resolve();
        });
    }

    Change(fileName: string, stats: fs.Stats) {
        this.changedFile = {
            Name: fileName,
            Stats: stats
        };
    }

    private get buildSingleFile() {
        return (process.argv.findIndex(x => x === "--fast") !== -1);
    }
}
