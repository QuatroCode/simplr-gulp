import * as fs from "fs";

import { Logger } from "../utils/logger";
import { WriteToFileAsJson } from "../utils/helpers";
import { GulpConfig } from "./configuration-contracts";
import { DEFAULT_EXTENSIONS_MAP, DEFAULT_GULP_CONFIG, DEFAULT_TYPESCRIPT_CONFIG } from "./configuration-defaults";

export interface PackageJson {
    [key: string]: any;
}

class ConfigurationLoader {
    private config: GulpConfig;

    // TODO: Inspect where is this used.
    // tslint:disable-next-line:no-empty
    public Init(): void {}

    private packageJson: PackageJson;

    constructor() {
        this.tryToReadConfigurationFile();
        this.checkTypeScriptConfigurationFiles();
        this.readPackageJSON();
    }

    private readPackageJSON(): void {
        this.packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    }

    private tryToReadConfigurationFile(cfgFileName: string = "gulpconfig"): void {
        try {
            const config = JSON.parse(fs.readFileSync(`./${cfgFileName}.json`, "utf8")) as GulpConfig;
            let valid = true;
            if (config.CfgVersion !== DEFAULT_GULP_CONFIG.CfgVersion) {
                Logger.warn(
                    `'${cfgFileName}.json' file major version is not valid (v${config.CfgVersion} != v${DEFAULT_GULP_CONFIG.CfgVersion})!`
                );
                valid = false;
            } else if (config.CfgVersion < DEFAULT_GULP_CONFIG.CfgVersion) {
                Logger.warn(
                    `'${cfgFileName}.json' file version is too old (v${config.CfgVersion} < v${DEFAULT_GULP_CONFIG.CfgVersion})!`
                );
                valid = false;
            } else {
                this.config = config;
            }

            if (!valid) {
                Logger.warn("Creating new file with default configuration.");
                WriteToFileAsJson(`${cfgFileName}-v${config.CfgVersion}.json`, config);
                this.config = DEFAULT_GULP_CONFIG;
                WriteToFileAsJson(`${cfgFileName}.json`, this.config);
            }
        } catch (e) {
            this.config = DEFAULT_GULP_CONFIG;
            WriteToFileAsJson(`${cfgFileName}.json`, this.config);
            Logger.warn("'gulpconfig.json' was not found or is not valid. Creating default configuration file.");
        }
    }

    private checkTypeScriptConfigurationFiles(): void {
        try {
            if (!fs.statSync(`./${this.config.TypeScriptConfig.Development}`).isFile()) {
                throw new Error();
            }
        } catch (e) {
            const tsConfig = {
                compilerOptions: DEFAULT_TYPESCRIPT_CONFIG.compilerOptions,
                exclude: DEFAULT_TYPESCRIPT_CONFIG.exclude
            };
            tsConfig.exclude.push(this.config.Directories.Build);
            WriteToFileAsJson(this.config.TypeScriptConfig.Development, tsConfig);
            Logger.warn(`'${this.config.TypeScriptConfig.Development}' was not found. Creating default TypeScript configuration file.`);
        }
        try {
            if (!fs.statSync(`./${this.config.TypeScriptConfig.Production}`).isFile()) {
                throw new Error();
            }
        } catch (error) {
            const tsConfig = DEFAULT_TYPESCRIPT_CONFIG;
            tsConfig.compilerOptions.inlineSources = false;
            tsConfig.compilerOptions.removeComments = true;
            tsConfig.compilerOptions.sourceMap = false;
            WriteToFileAsJson(this.config.TypeScriptConfig.Production, tsConfig);
            Logger.warn(`'${this.config.TypeScriptConfig.Production}' was not found. Creating default TypeScript configuration file.`);
        }
    }

    public get GulpConfig(): GulpConfig {
        return this.config;
    }

    public get DefaultExtensions(): { [key: string]: string } {
        return DEFAULT_EXTENSIONS_MAP;
    }

    public get Package(): PackageJson {
        return this.packageJson;
    }
}

export const Configuration = new ConfigurationLoader();
