import { fs } from "mz";
import * as path from "path";
import * as ts from "typescript";
import * as Linter from "tslint";
import { glob } from "multi-glob";
import { ILinterOptionsRaw, LintResult } from "tslint/lib/lint";
import Configuration from "../../configuration/configuration";
import { Logger } from "../../utils/logger";

interface TsConfig {
    compilerOptions: any;
    include: string[];
    exclude?: string[];
}

interface CompileResult {
    EmitResult: ts.EmitResult;
    PreEmitDiagnostics: ts.Diagnostic[];
}

export class DirectTypescriptBuilder {

    constructor(logger: Logger) {
        if (DirectTypescriptBuilder.TypescriptProgram == null) {
            this.PrintTypescriptVersion(logger);
        }
    }

    protected static TypescriptProgram: ts.Program | undefined;

    public async Build(files: string[] | undefined, production: boolean, fullBuild: boolean = true): Promise<ts.Diagnostic[]> {
        return new Promise<ts.Diagnostic[]>(async (resolve, reject) => {
            let tsConfigFromJson: TsConfig = this.LoadTsConfig(production);

            // Parse compiler options (e.g. jsx: react -> jsx: 2)
            let parsedCompilerOptions = ts.convertCompilerOptionsFromJson(tsConfigFromJson.compilerOptions, process.cwd());

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
                let result = this.CompileAndEmit(files, parsedCompilerOptions.options);

                // Resolve with combined diagnostics
                resolve(result.PreEmitDiagnostics.concat(result.EmitResult.diagnostics));
            }
            // Full build...
            else {
                // Glob files with patterns from tsconfig.json include and exclude properties
                let globbedFiles = await this.GlobTypescriptFiles(tsConfigFromJson.include, tsConfigFromJson.exclude);

                // Compile and emit all globbed files
                let result = this.CompileAndEmit(globbedFiles, parsedCompilerOptions.options);

                // Resolve with combined diagnostics
                resolve(result.PreEmitDiagnostics.concat(result.EmitResult.diagnostics));
            }
        });
    }

    protected CompileAndEmit(files: string[], compilerOptions: ts.CompilerOptions): CompileResult {
        // Create a program and pass an old program
        DirectTypescriptBuilder.TypescriptProgram = ts.createProgram(files, compilerOptions, undefined, DirectTypescriptBuilder.TypescriptProgram);

        // Gather pre-emit diagnostics
        let preEmitDiagnostics = ts.getPreEmitDiagnostics(DirectTypescriptBuilder.TypescriptProgram);

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
                let excluded = exclude.map(item => `!${item}`);
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
                let typescriptFiles = globbedFiles.filter(file => {
                    let extension = path.extname(file);
                    return allowedExtensions == null || allowedExtensions.indexOf(extension) !== -1;
                });
                resolve(typescriptFiles);
            });
        });
    }

    public LoadTsConfig(production: boolean): TsConfig {
        let tsConfigName = production ?
            Configuration.GulpConfig.TypeScriptConfig.Production :
            Configuration.GulpConfig.TypeScriptConfig.Development;

        // Get tsconfig.json path
        let tsConfigPath = path.normalize(`${process.cwd()}/${tsConfigName}`);

        // Read its contents
        return require(tsConfigPath);
    }

    public async Lint(files: string[], lintDefinitions: boolean = false): Promise<LintResult[]> {
        //TODO: Use custom tslint configuration file
        let tslintConfigPath = path.normalize(`${process.cwd()}/tslint.json`);
        let configurationFile = Linter.loadConfigurationFromPath(tslintConfigPath);
        let options: ILinterOptionsRaw = {
            formatter: "verbose",
            configuration: configurationFile
        };
        let lintResults: LintResult[] = [];
        for (let file of files) {
            let stats = await fs.stat(file);
            if (stats.isFile()) {
                let contents = await fs.readFile(file, "utf8");
                let linter = new Linter(file, contents, options, DirectTypescriptBuilder.TypescriptProgram);
                let result = linter.lint();
                lintResults.push(result);
            }
        }
        return lintResults;
    }

    public async LintAll(production: boolean): Promise<LintResult[]> {
        let tsConfigFromJson: TsConfig = this.LoadTsConfig(production);
        let globbedFiles = await this.GlobTypescriptFiles(tsConfigFromJson.include, tsConfigFromJson.exclude);

        return await this.Lint(globbedFiles);
    }

    public PrintTypescriptVersion(logger: Logger) {
        logger.withType("TS").info(`Using 'Typescript@${ts.version}'`);
    }

    public PrintDiagnostics(diagnostics: ts.Diagnostic[], logger: Logger, production: boolean) {
        let tsConfig = this.LoadTsConfig(production);
        let skipDefaultLibCheck = tsConfig.compilerOptions.skipDefaultLibCheck;
        for (let diagnostic of diagnostics) {
            if (diagnostic.file == null ||
                diagnostic.file.isDeclarationFile && skipDefaultLibCheck === true) {
                return;
            }

            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            let cwdNormalized = path.normalize(process.cwd());
            let relativePath = path.normalize(diagnostic.file.fileName).replace(`${cwdNormalized}${path.sep}`, "");
            logger.withType("TS").error(`${relativePath}[${line + 1}, ${character + 1}]: `, message);
        }
    }

    public PrintLintResults(results: LintResult[], logger: Logger, production: boolean) {
        let tsConfig = this.LoadTsConfig(production);
        let skipDefaultLibCheck = tsConfig.compilerOptions.skipDefaultLibCheck;

        for (let lintResult of results.filter(x => x.failureCount > 0)) {
            for (let failure of lintResult.failures) {
                let fileName = failure.getFileName();

                if (skipDefaultLibCheck === true) {
                    let dts = ".d.ts";
                    let dtsLength = dts.length;
                    if (fileName.substr(fileName.length - dtsLength) === dts) {
                        continue;
                    }
                }

                let position = failure.getStartPosition().getLineAndCharacter();
                let line = `${fileName}[${position.line + 1}, ${position.character + 1}]: ${failure.getFailure()} (${failure.getRuleName()})`;
                logger.warn(line);
            };
        }
    }
}