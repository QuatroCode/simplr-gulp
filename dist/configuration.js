var logger_1 = require('./logger');
var fs = require('fs');
var utils_1 = require('./utils');
var defaults_1 = require('./defaults');
var Configuration = (function () {
    function Configuration() {
        this.tryToReadConfigurationFile();
        this.checkTypeScriptConfigurationFiles();
    }
    Configuration.prototype.tryToReadConfigurationFile = function (cfgFileName) {
        if (cfgFileName === void 0) { cfgFileName = 'gulpconfig'; }
        try {
            var config = require("./" + cfgFileName + ".json");
            var valid = true;
            if (parseInt(config.CfgVersion.toString()) != parseInt(defaults_1.DEFAULT_GULP_CONFIG.CfgVersion.toString())) {
                logger_1.default.warn("'" + cfgFileName + ".json' file major version is not valid (v" + config.CfgVersion + " != v" + defaults_1.DEFAULT_GULP_CONFIG.CfgVersion + ")!");
                valid = false;
            }
            else if (config.CfgVersion < defaults_1.DEFAULT_GULP_CONFIG.CfgVersion) {
                logger_1.default.warn("'" + cfgFileName + ".json' file version is too old (v" + config.CfgVersion + " < v" + defaults_1.DEFAULT_GULP_CONFIG.CfgVersion + ")!");
                valid = false;
            }
            else {
                this.config = config;
            }
            if (!valid) {
                logger_1.default.warn("Creating new file with default configuration.");
                utils_1.WriteToFileAsJson(cfgFileName + "-v" + config.CfgVersion + ".json", config);
                this.config = defaults_1.DEFAULT_GULP_CONFIG;
                utils_1.WriteToFileAsJson(cfgFileName + ".json", this.config);
            }
        }
        catch (e) {
            this.config = defaults_1.DEFAULT_GULP_CONFIG;
            utils_1.WriteToFileAsJson(cfgFileName + ".json", this.config);
            logger_1.default.warn("'gulpconfig.json' was not found or is not valid. Creating default configuration file.");
        }
    };
    Configuration.prototype.checkTypeScriptConfigurationFiles = function () {
        try {
            if (!fs.statSync("./" + this.config.TypeScriptConfig.Development).isFile())
                throw new Error();
        }
        catch (e) {
            var tsConfig = {
                compilerOptions: defaults_1.DEFAULT_TYPESCRIPT_CONFIG.compilerOptions,
                exclude: defaults_1.DEFAULT_TYPESCRIPT_CONFIG.exclude
            };
            tsConfig.exclude.push(this.config.Directories.Build);
            utils_1.WriteToFileAsJson(this.config.TypeScriptConfig.Development, tsConfig);
            logger_1.default.warn("'" + this.config.TypeScriptConfig.Development + "' was not found. Creating default TypeScript configuration file.");
        }
        try {
            if (!fs.statSync("./" + this.config.TypeScriptConfig.Production).isFile())
                throw new Error();
        }
        catch (e) {
            var tsConfig = defaults_1.DEFAULT_TYPESCRIPT_CONFIG;
            tsConfig.compilerOptions.inlineSources = false;
            tsConfig.compilerOptions.removeComments = true;
            tsConfig.compilerOptions.sourceMap = false;
            utils_1.WriteToFileAsJson(this.config.TypeScriptConfig.Production, tsConfig);
            logger_1.default.warn("'" + this.config.TypeScriptConfig.Production + "' was not found. Creating default TypeScript configuration file.");
        }
    };
    Object.defineProperty(Configuration.prototype, "GulpConfig", {
        get: function () {
            return this.config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "ExtensionsMap", {
        get: function () {
            return defaults_1.DEFAULT_EXTENSIONS_MAP;
        },
        enumerable: true,
        configurable: true
    });
    return Configuration;
}());
exports.Configuration = Configuration;
var Config = new Configuration();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Config;
