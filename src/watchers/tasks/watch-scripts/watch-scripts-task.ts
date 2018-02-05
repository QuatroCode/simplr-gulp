import * as fs from "fs";
import { LintResult } from "tslint";

import { WatchTaskBase } from "../../watcher-task-base";
import { Paths } from "../../../paths/paths";
import { Logger } from "../../../utils/logger";
import { DirectTypescriptBuilder } from "../../../builders/typescript/typescript-direct-builder";
import { TimePromise, TimedPromiseResult } from "../../../utils/helpers";

const noTsFlag: string = "--noTs";
const noTsLintFlag: string = "--noTsLint";

export class WatchScriptsTask extends WatchTaskBase {
    constructor() {
        super();
        this.Builder = new DirectTypescriptBuilder(Logger);
    }

    public Builder: DirectTypescriptBuilder;
    public TaskNamePrefix: string = "Build";
    public Name: string = "Scripts";

    public Globs: string = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

    protected UseWatchTaskFunctionOnly: boolean = true;

    private changedFile: { Name: string; Stats: fs.Stats };

    protected WatchTaskFunction = async (production: boolean) =>
        new Promise(async (resolve, reject) => {
            const logger = Logger.withType("Scripts");

            if (this.noTs && this.noTsLint) {
                logger.warn(`Both ${noTsFlag} and ${noTsLintFlag} flags are active. Nothing to do here...`);
            }

            if (!this.noTs) {
                logger.info("Compiling...");
                const timedBuild = await TimePromise(async () =>
                    this.Builder.Build([this.changedFile.Name], production, !this.buildSingleFile)
                );
                const diagnostics = timedBuild.Result;
                logger.info(`Compilation done in ${timedBuild.Elapsed}ms.`);
                this.Builder.PrintDiagnostics(diagnostics, Logger, production);
            }

            // Resolve prematurely
            resolve();

            if (!this.noTsLint) {
                // And lint asynchronously
                logger.info("Linting...");
                let timedLint: TimedPromiseResult<LintResult[]>;
                if (this.buildSingleFile) {
                    timedLint = await TimePromise(async () => this.Builder.Lint([this.changedFile.Name]));
                } else {
                    timedLint = await TimePromise(async () => this.Builder.LintAll(production));
                }
                const lintResults = timedLint.Result;
                logger.info(`Linting done in ${timedLint.Elapsed}ms.`);
                this.Builder.PrintLintResults(lintResults, Logger, production);
            }
        });

    public Change(fileName: string, stats: fs.Stats): void {
        this.changedFile = {
            Name: fileName,
            Stats: stats
        };
    }

    private get buildSingleFile(): boolean {
        return process.argv.findIndex(x => x === "--fast") !== -1;
    }

    private get noTsLint(): boolean {
        return process.argv.findIndex(x => x === noTsLintFlag) !== -1;
    }

    private get noTs(): boolean {
        return process.argv.findIndex(x => x === noTsFlag) !== -1;
    }
}
