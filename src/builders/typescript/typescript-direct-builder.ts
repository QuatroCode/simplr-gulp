import { fs } from "mz";
import * as path from "path";
import * as ts from "typescript";
import { Linter } from "tslint";
import { glob } from "multi-glob";
import { LintResult, ILinterOptions } from "tslint";

import { Configuration } from "../../configuration/configuration";
import { LoggerClass } from "../../utils/logger";

interface TsConfig {
    compilerOptions: any;
    include?: string[];
    exclude?: string[];
}

interface CompileResult {
    EmitResult: ts.EmitResult;
    PreEmitDiagnostics: ts.Diagnostic[];
}

export class DirectTypescriptBuilder {
    constructor(logger: LoggerClass) {
        if (DirectTypescriptBuilder.TypescriptProgram == null) {
            this.PrintTypescriptVersion(logger);
        }
    }

    protected static TypescriptProgram: ts.Program | undefined;

    public async Build(files: string[] | undefined, production: boolean, fullBuild: boolean = true): Promise<ts.Diagnostic[]> {
        return new Promise<ts.Diagnostic[]>(async (resolve, reject) => {
            const tsConfigFromJson: TsConfig = this.LoadTsConfig(production);

            // Parse compiler options (e.g. jsx: react -> jsx: 2)
            const parsedCompilerOptions = ts.convertCompilerOptionsFromJson(tsConfigFromJson.compilerOptions, process.cwd());

            // Check if options parsing did not fail
            if (parsedCompilerOptions.errors.length !== 0) {
                // Reject if they did
                let reason = "Compiler options parsing failed:";
                parsedCompilerOptions.errors.forEach(error => {
                    reason += `\n${error}`;
                });
                reject(reason);
                return;
            }

            // Fast build?
            if (!fullBuild) {
                if (files == null || files.length === 0) {
                    reject("No files were given to compile.");
                    return;
                }

                // Compile and emit only given files
                const result = this.CompileAndEmit(files, parsedCompilerOptions.options);

                // Resolve with combined diagnostics
                resolve(result.PreEmitDiagnostics.concat(result.EmitResult.diagnostics));
            } else {
                // Full build...

                // Glob files with patterns from tsconfig.json include and exclude properties
                const globbedFiles = await this.GlobTypescriptFiles(tsConfigFromJson.include || [], tsConfigFromJson.exclude || []);
                const allFiles = globbedFiles.concat(files || []);

                // Compile and emit all globbed files
                // tslint:disable-next-line:prefer-const
                let result = this.CompileAndEmit(allFiles, parsedCompilerOptions.options);

                // Resolve with combined diagnostics
                resolve(result.PreEmitDiagnostics.concat(result.EmitResult.diagnostics));
            }
        });
    }

    protected CompileAndEmit(files: string[], compilerOptions: ts.CompilerOptions): CompileResult {
        // Create a program and pass an old program
        DirectTypescriptBuilder.TypescriptProgram = ts.createProgram(
            files,
            compilerOptions,
            undefined,
            DirectTypescriptBuilder.TypescriptProgram
        );

        // Gather pre-emit diagnostics
        const preEmitDiagnostics = ts.getPreEmitDiagnostics(DirectTypescriptBuilder.TypescriptProgram);

        // Compile and emit output
        return {
            EmitResult: DirectTypescriptBuilder.TypescriptProgram.emit(),
            PreEmitDiagnostics: preEmitDiagnostics
        };
    }

    protected async GlobTypescriptFiles(include: string[], exclude?: string[], allowedExtensions?: string[]): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let patterns: string[] = include;
            if (exclude != null) {
                const excluded = exclude.map(item => `!${item}`);
                patterns = patterns.concat(excluded);
            }
            glob(patterns, (error, globbedFiles) => {
                if (error != null) {
                    reject(error);
                    return;
                }
                if (allowedExtensions == null) {
                    allowedExtensions = [".ts", ".tsx"];
                }
                const typescriptFiles = globbedFiles.filter(file => {
                    const extension = path.extname(file);
                    return allowedExtensions == null || allowedExtensions.indexOf(extension) !== -1;
                });
                resolve(typescriptFiles);
            });
        });
    }

    public LoadTsConfig(production: boolean): TsConfig {
        const tsConfigName = production
            ? Configuration.GulpConfig.TypeScriptConfig.Production
            : Configuration.GulpConfig.TypeScriptConfig.Development;

        // Get tsconfig.json path
        const tsConfigPath = path.normalize(`${process.cwd()}/${tsConfigName}`);

        // Read its contents
        return require(tsConfigPath);
    }

    public async Lint(files: string[], lintDefinitions: boolean = false): Promise<LintResult[]> {
        // //TODO: Use custom tslint configuration file
        // const tslintConfigPath = path.normalize(`${process.cwd()}/tslint.json`);
        const options: ILinterOptions = {
            formatter: "verbose",
            fix: false
        };
        const lintResults: LintResult[] = [];
        for (const file of files) {
            const stats = await fs.stat(file);
            if (stats.isFile()) {
                const contents = await fs.readFile(file, "utf8");
                const linter = new Linter(options, DirectTypescriptBuilder.TypescriptProgram);
                linter.lint(file, contents);
                lintResults.push(linter.getResult());
            }
        }
        return lintResults;
    }

    public async LintAll(production: boolean): Promise<LintResult[]> {
        const tsConfigFromJson: TsConfig = this.LoadTsConfig(production);
        const globbedFiles = await this.GlobTypescriptFiles(tsConfigFromJson.include || [], tsConfigFromJson.exclude || []);

        return await this.Lint(globbedFiles);
    }

    public PrintTypescriptVersion(logger: LoggerClass): void {
        logger.withType("TS").info(`Using 'Typescript@${ts.version}'`);
    }

    public PrintDiagnostics(diagnostics: ts.Diagnostic[], logger: LoggerClass, production: boolean): void {
        const tsConfig = this.LoadTsConfig(production);
        const skipDefaultLibCheck = tsConfig.compilerOptions.skipDefaultLibCheck;
        for (const diagnostic of diagnostics) {
            if (diagnostic.file == null || (diagnostic.file.isDeclarationFile && skipDefaultLibCheck === true)) {
                return;
            }

            if (diagnostic.start) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                const cwdNormalized = path.normalize(process.cwd());
                const relativePath = path.normalize(diagnostic.file.fileName).replace(`${cwdNormalized}${path.sep}`, "");
                logger.withType("TS").error(`${relativePath}[${line + 1}, ${character + 1}]: `, message);
            }
        }
    }

    public PrintLintResults(results: LintResult[], logger: LoggerClass, production: boolean): void {
        const tsConfig = this.LoadTsConfig(production);
        const skipDefaultLibCheck = tsConfig.compilerOptions.skipDefaultLibCheck;

        for (const lintResult of results.filter(x => x.errorCount > 0)) {
            for (const failure of lintResult.failures) {
                const fileName = failure.getFileName();

                if (skipDefaultLibCheck === true) {
                    const dts = ".d.ts";
                    const dtsLength = dts.length;
                    if (fileName.substr(fileName.length - dtsLength) === dts) {
                        continue;
                    }
                }

                const position = failure.getStartPosition().getLineAndCharacter();
                const line = `${fileName}[${position.line + 1}, ${position.character +
                    1}]: ${failure.getFailure()} (${failure.getRuleName()})`;
                logger.warn(line);
            }
        }
    }
}
