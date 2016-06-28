'use strict';

var gulp = require('gulp');
var express = require('express');
var Colors = require('colors/safe');
var fs = require('fs');
var path = require('path');

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function WriteToFileAsJson(fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content, null, 4));
}
function Pad(num, size) {
    var s = "000000000" + num.toString();
    return s.substr(s.length - size);
}
function GetTimeNow() {
    var date = new Date(), hours = Pad(date.getHours(), 2), minutes = Pad(date.getMinutes(), 2), seconds = Pad(date.getSeconds(), 2);
    return hours + ":" + minutes + ":" + seconds;
}

var LogType;
(function (LogType) {
    LogType[LogType["Default"] = 0] = "Default";
    LogType[LogType["Error"] = 1] = "Error";
    LogType[LogType["Info"] = 2] = "Info";
    LogType[LogType["Warning"] = 3] = "Warning";
})(LogType || (LogType = {}));
var Console = (function () {
    function Console() {
        this.styles = Colors.styles;
    }
    Console.prototype.getTimeNowWithStyles = function () {
        return "[" + this.styles.grey.open + GetTimeNow() + this.styles.grey.close + "]";
    };
    Console.prototype.showMessage = function (type) {
        var message = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            message[_i - 1] = arguments[_i];
        }
        var typeString = " " + LogType[type].toLocaleUpperCase() + ":";
        var log = console.log;
        var color = this.styles.white.open;
        switch (type) {
            case LogType.Error:
                {
                    color = this.styles.red.open;
                    log = console.error;
                }
                break;
            case LogType.Info:
                {
                    color = this.styles.cyan.open;
                    log = console.info;
                }
                break;
            case LogType.Warning:
                {
                    color = this.styles.yellow.open;
                    log = console.warn;
                }
                break;
            default: {
                typeString = "";
            }
        }
        log.apply(void 0, ["" + this.getTimeNowWithStyles() + this.styles.bold.open + color + typeString].concat(message, [this.styles.reset.open]));
    };
    Console.prototype.log = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Default].concat(message));
    };
    Console.prototype.error = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Error].concat(message));
    };
    Console.prototype.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Info].concat(message));
    };
    Console.prototype.warn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Warning].concat(message));
    };
    return Console;
}());
var logger = new Console();

var DEFAULT_TYPESCRIPT_CONFIG = {
    compilerOptions: {
        module: "commonjs",
        target: "es5",
        noImplicitAny: true,
        preserveConstEnums: true,
        removeComments: false,
        sourceMap: true,
        inlineSources: true
    },
    exclude: [
        "node_modules",
        "src/libs"
    ]
};
var DEFAULT_GULP_CONFIG = {
    Directories: {
        Source: "src",
        Build: "wwwroot",
        App: "app"
    },
    TypeScriptConfig: {
        Development: "tsconfig.json",
        Production: "tsconfig.production.json"
    },
    ServerConfig: {
        Ip: "127.0.0.1",
        Port: 4000,
        LiveReloadPort: 4400
    },
    BundleConfig: {
        AppFile: "app.js",
        BuildFile: "build.js",
        Include: [],
        Exclude: ['[wwwroot/js/app/**/*]']
    },
    WebConfig: null,
    CfgVersion: 2.02
};
var DEFAULT_EXTENSIONS_MAP = {
    "ts": "js",
    "tsx": "js",
    "scss": "css",
    ".ts": ".js",
    ".tsx": ".js",
    ".scss": ".css"
};

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
            if (parseInt(config.CfgVersion.toString()) != parseInt(DEFAULT_GULP_CONFIG.CfgVersion.toString())) {
                logger.warn("'" + cfgFileName + ".json' file major version is not valid (v" + config.CfgVersion + " != v" + DEFAULT_GULP_CONFIG.CfgVersion + ")!");
                valid = false;
            }
            else if (config.CfgVersion < DEFAULT_GULP_CONFIG.CfgVersion) {
                logger.warn("'" + cfgFileName + ".json' file version is too old (v" + config.CfgVersion + " < v" + DEFAULT_GULP_CONFIG.CfgVersion + ")!");
                valid = false;
            }
            else {
                this.config = config;
            }
            if (!valid) {
                logger.warn("Creating new file with default configuration.");
                WriteToFileAsJson(cfgFileName + "-v" + config.CfgVersion + ".json", config);
                this.config = DEFAULT_GULP_CONFIG;
                WriteToFileAsJson(cfgFileName + ".json", this.config);
            }
        }
        catch (e) {
            this.config = DEFAULT_GULP_CONFIG;
            WriteToFileAsJson(cfgFileName + ".json", this.config);
            logger.warn("'gulpconfig.json' was not found or is not valid. Creating default configuration file.");
        }
    };
    Configuration.prototype.checkTypeScriptConfigurationFiles = function () {
        try {
            if (!fs.statSync("./" + this.config.TypeScriptConfig.Development).isFile())
                throw new Error();
        }
        catch (e) {
            var tsConfig = {
                compilerOptions: DEFAULT_TYPESCRIPT_CONFIG.compilerOptions,
                exclude: DEFAULT_TYPESCRIPT_CONFIG.exclude
            };
            tsConfig.exclude.push(this.config.Directories.Build);
            WriteToFileAsJson(this.config.TypeScriptConfig.Development, tsConfig);
            logger.warn("'" + this.config.TypeScriptConfig.Development + "' was not found. Creating default TypeScript configuration file.");
        }
        try {
            if (!fs.statSync("./" + this.config.TypeScriptConfig.Production).isFile())
                throw new Error();
        }
        catch (e) {
            var tsConfig = DEFAULT_TYPESCRIPT_CONFIG;
            tsConfig.compilerOptions.inlineSources = false;
            tsConfig.compilerOptions.removeComments = true;
            tsConfig.compilerOptions.sourceMap = false;
            WriteToFileAsJson(this.config.TypeScriptConfig.Production, tsConfig);
            logger.warn("'" + this.config.TypeScriptConfig.Production + "' was not found. Creating default TypeScript configuration file.");
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
            return DEFAULT_EXTENSIONS_MAP;
        },
        enumerable: true,
        configurable: true
    });
    return Configuration;
}());
var Config = new Configuration();

var ServerStarter = (function () {
    function ServerStarter() {
        var _this = this;
        this.server = express();
        this.onRequest = function (req, res) {
            var Build = Config.GulpConfig.Directories.Build;
            res.sendFile('index.html', { root: Build });
        };
        this.onClose = function () {
            logger.info("Server closed.");
        };
        this.onError = function (err) {
            if (err.code === 'EADDRINUSE') {
                logger.error("Port " + Config.GulpConfig.ServerConfig.Port + " already in use.");
                _this.Listener.close();
            }
            else {
                logger.error("Exeption not handled. Please create issues with error code: \n", err);
            }
        };
        var _a = Config.GulpConfig, ServerConfig = _a.ServerConfig, Directories = _a.Directories;
        logger.info("Server started at " + ServerConfig.Ip + ":" + ServerConfig.Port);
        this.server.use(express.static(Directories.Build));
        this.Listener = this.server.listen(ServerConfig.Port);
        this.addListeners();
    }
    ServerStarter.prototype.addListeners = function () {
        this.Listener.once("close", this.onClose);
        this.Listener.once('error', this.onError);
        this.server.all('/*', this.onRequest);
    };
    return ServerStarter;
}());

var BuilderBase = (function () {
    function BuilderBase() {
    }
    BuilderBase.prototype.InSource = function (param) {
        if (param === void 0) { param = undefined; }
        var startPath = Paths.Directories.Source;
        return this.builder(startPath, param);
    };
    BuilderBase.prototype.InSourceApp = function (param) {
        if (param === void 0) { param = undefined; }
        var startPath = Paths.Directories.SourceApp;
        return this.builder(startPath, param);
    };
    BuilderBase.prototype.InBuild = function (param) {
        if (param === void 0) { param = undefined; }
        var startPath = Paths.Directories.Build;
        return this.builder(startPath, param);
    };
    BuilderBase.prototype.InBuildApp = function (param) {
        if (param === void 0) { param = undefined; }
        var startPath = Paths.Directories.BuildApp;
        return this.builder(startPath, param);
    };
    return BuilderBase;
}());
var DirectoriesBuilder = (function () {
    function DirectoriesBuilder() {
        this.gulpConfig = Config.GulpConfig;
        this.Source = this.gulpConfig.Directories.Source;
        this.SourceApp = path.join(this.Source, this.gulpConfig.Directories.App);
        this.Build = this.gulpConfig.Directories.Build;
        this.BuildApp = path.join(this.Build, this.gulpConfig.Directories.App);
    }
    return DirectoriesBuilder;
}());
var AllFilesBuilder = (function (_super) {
    __extends(AllFilesBuilder, _super);
    function AllFilesBuilder() {
        _super.apply(this, arguments);
    }
    AllFilesBuilder.prototype.builder = function (startPath, name) {
        if (name != undefined) {
            return path.join(startPath, '**', '*' + name);
        }
        else {
            return path.join(startPath, '**', '*');
        }
    };
    return AllFilesBuilder;
}(BuilderBase));
var OneFileBuilder = (function (_super) {
    __extends(OneFileBuilder, _super);
    function OneFileBuilder() {
        _super.apply(this, arguments);
    }
    OneFileBuilder.prototype.builder = function (startPath, name) {
        return path.join(startPath, name);
    };
    return OneFileBuilder;
}(BuilderBase));
var AllDirectoriesBuilder = (function (_super) {
    __extends(AllDirectoriesBuilder, _super);
    function AllDirectoriesBuilder() {
        _super.apply(this, arguments);
    }
    AllDirectoriesBuilder.prototype.builder = function (startPath, name) {
        return path.join(startPath, "**", name, "**", "*");
    };
    return AllDirectoriesBuilder;
}(BuilderBase));
var OneDirectoryBuilder = (function (_super) {
    __extends(OneDirectoryBuilder, _super);
    function OneDirectoryBuilder() {
        _super.apply(this, arguments);
    }
    OneDirectoryBuilder.prototype.builder = function (startPath, name) {
        return path.join(startPath, name, "**", "*");
    };
    return OneDirectoryBuilder;
}(BuilderBase));
var Paths;
(function (Paths) {
    Paths.Directories = new DirectoriesBuilder();
    var Builders;
    (function (Builders) {
        Builders.AllFiles = new AllFilesBuilder();
        Builders.OneFile = new OneFileBuilder();
        Builders.AllDirectories = new AllDirectoriesBuilder();
        Builders.OneDirectory = new OneDirectoryBuilder();
    })(Builders = Paths.Builders || (Paths.Builders = {}));
})(Paths || (Paths = {}));
var Paths$1 = Paths;

var Watcher = (function () {
    function Watcher() {
        this.watchers = {};
        this.onConfigurationsChanged = function (done) {
            logger.log("onConfigurationsChanged");
            done();
        };
        this.onAssetsChanged = function (done) {
            logger.log("onAssetsChanged");
            done();
        };
        this.onStyleSheetsChanged = function (done) {
            logger.log("onStyleSheetsChanged");
            done();
        };
        this.onTypescriptChanged = function (done) {
            logger.log("onTypescriptChanged");
            done();
        };
        this.onHtmlChanged = function (done) {
            logger.log("test");
            done();
        };
        var Directories = Config.GulpConfig.Directories;
        this.createWatchersTasks();
        this.createWatchers();
        logger.info("Started watching files in '" + Directories.Source + "' folder.");
    }
    Watcher.prototype.createWatchersTasks = function () {
        gulp.task("_Watcher.Html", this.onHtmlChanged);
        gulp.task("_Watcher.Typescript", this.onTypescriptChanged);
        gulp.task("_Watcher.StyleSheets", this.onStyleSheetsChanged);
        gulp.task("_Watcher.Assets", this.onAssetsChanged);
        gulp.task("_Watcher.Configurations", this.onConfigurationsChanged);
    };
    Watcher.prototype.createWatchers = function () {
        this.watchers.Html = gulp.watch(Paths$1.Builders.AllFiles.InSource(".html"), gulp.parallel("_Watcher.Html"));
        this.watchers.Typescript = gulp.watch(Paths$1.Builders.AllFiles.InSource(".{ts,tsx}"), gulp.parallel("_Watcher.Typescript"));
        this.watchers.StyleSheets = gulp.watch(Paths$1.Builders.AllFiles.InSource(".scss"), gulp.parallel("_Watcher.StyleSheets"));
        this.watchers.Assets = gulp.watch(Paths$1.Builders.AllDirectories.InSource("assets"), gulp.parallel("_Watcher.Assets"));
        this.watchers.Configurations = gulp.watch(Paths$1.Builders.OneDirectory.InSource("configs"), gulp.parallel("_Watcher.Configurations"));
    };
    return Watcher;
}());

gulp.task("default", function (done) {
    var watcher = new Watcher();
});
gulp.task("_server", function (done) {
    var server = new ServerStarter();
    server.Listener.on("close", function () {
        done();
    });
});