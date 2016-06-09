import Console from './logger';
import * as fs from 'fs';
import { WriteToFileAsJson } from './utils';
import { ConfigurationContracts } from './contracts';
import { DEFAULT_EXTENSIONS_MAP, DEFAULT_GULP_CONFIG, DEFAULT_TYPESCRIPT_CONFIG } from './defaults';



export class Configuration {

    private config: ConfigurationContracts.GulpConfig;

    constructor() {
        this.tryToReadConfigurationFile();
        this.checkTypeScriptConfigurationFiles();
    }

    private tryToReadConfigurationFile(cfgFileName: string = 'gulpconfig') {
        try {
            let config = require(`./${cfgFileName}.json`) as ConfigurationContracts.GulpConfig;

            let valid = true;
            if (parseInt(config.CfgVersion.toString()) != parseInt(DEFAULT_GULP_CONFIG.CfgVersion.toString())) {
                Console.warn(`'${cfgFileName}.json' file major version is not valid (v${config.CfgVersion} != v${DEFAULT_GULP_CONFIG.CfgVersion})!`);
                valid = false;
            } else if (config.CfgVersion < DEFAULT_GULP_CONFIG.CfgVersion) {
                Console.warn(`'${cfgFileName}.json' file version is too old (v${config.CfgVersion} < v${DEFAULT_GULP_CONFIG.CfgVersion})!`);
                valid = false;
            } else {
                this.config = config;
            }

            if (!valid) {
                Console.warn("Creating new file with default configuration.");
                WriteToFileAsJson(`${cfgFileName}-v${config.CfgVersion}.json`, config);
                this.config = DEFAULT_GULP_CONFIG;
                WriteToFileAsJson(`${cfgFileName}.json`, this.config);
            }
        } catch (e) {
            this.config = DEFAULT_GULP_CONFIG;
            WriteToFileAsJson(`${cfgFileName}.json`, this.config);
            Console.warn("'gulpconfig.json' was not found or is not valid. Creating default configuration file.");
        }
    }

    private checkTypeScriptConfigurationFiles() {
        try {
            if (!fs.statSync(`./${this.config.TypeScriptConfig.Development}`).isFile()) throw new Error();
        } catch (e) {
            let tsConfig = {
                compilerOptions: DEFAULT_TYPESCRIPT_CONFIG.compilerOptions,
                exclude: DEFAULT_TYPESCRIPT_CONFIG.exclude
            };
            tsConfig.exclude.push(this.config.Directories.Build);
            WriteToFileAsJson(this.config.TypeScriptConfig.Development, tsConfig);
            Console.warn(`'${this.config.TypeScriptConfig.Development}' was not found. Creating default TypeScript configuration file.`);
        }
        try {
            if (!fs.statSync(`./${this.config.TypeScriptConfig.Production}`).isFile()) throw new Error();
        } catch (e) {
            let tsConfig = DEFAULT_TYPESCRIPT_CONFIG;
            tsConfig.compilerOptions.inlineSources = false;
            tsConfig.compilerOptions.removeComments = true;
            tsConfig.compilerOptions.sourceMap = false;
            WriteToFileAsJson(this.config.TypeScriptConfig.Production, tsConfig);
            Console.warn(`'${this.config.TypeScriptConfig.Production}' was not found. Creating default TypeScript configuration file.`);
        }
    }

    get GulpConfig() {
        return this.config;
    }

    get ExtensionsMap() {
        return DEFAULT_EXTENSIONS_MAP;
    }

}

let Config = new Configuration();
export default Config;