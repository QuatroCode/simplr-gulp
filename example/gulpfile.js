'use strict';

var fs = require('fs');
var Colors = require('colors/safe');
var gulp = require('gulp');
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
function GetClassName(constructor) {
    if (constructor != null) {
        var functionString = constructor.toString();
        if (functionString.length > 0) {
            var match = functionString.match(/\w+/g);
            if (match != null && match[1] != null) {
                return match[1];
            }
        }
    }
    return "";
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

var ConfigurationLoader = (function () {
    function ConfigurationLoader() {
        this.tryToReadConfigurationFile();
        this.checkTypeScriptConfigurationFiles();
    }
    ConfigurationLoader.prototype.Init = function () { };
    ;
    ConfigurationLoader.prototype.tryToReadConfigurationFile = function (cfgFileName) {
        if (cfgFileName === void 0) { cfgFileName = 'gulpconfig'; }
        try {
            var config = require("./" + cfgFileName + ".json");
            var valid = true;
            if (parseInt(config.CfgVersion.toString()) !== parseInt(DEFAULT_GULP_CONFIG.CfgVersion.toString())) {
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
    ConfigurationLoader.prototype.checkTypeScriptConfigurationFiles = function () {
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
    Object.defineProperty(ConfigurationLoader.prototype, "GulpConfig", {
        get: function () {
            return this.config;
        },
        enumerable: true,
        configurable: true
    });
    return ConfigurationLoader;
}());
var Configuration = new ConfigurationLoader();

var TasksHandler = (function () {
    function TasksHandler(config) {
        this._className = GetClassName(this.constructor);
        this._moduleName = "TasksHandler." + this._className;
        this.configuration = config(this.initConfiguration);
        this.constructedTasks = this.registerTasks(this.configuration.Tasks);
        this.loadTasksHandlers(this.configuration.TasksHandlers);
        this.registerMainTask();
    }
    Object.defineProperty(TasksHandler.prototype, "initConfiguration", {
        get: function () {
            return {
                TasksPrefix: "",
                TasksSufix: "",
                Tasks: [],
                TasksHandlers: [],
                TasksAsync: true,
                WithProduction: false
            };
        },
        enumerable: true,
        configurable: true
    });
    TasksHandler.prototype.registerTasks = function (tasks) {
        var _this = this;
        var constructedTasks = {};
        if (tasks != null && tasks.length > 0) {
            tasks.forEach(function (task) {
                var constructedTask = new task();
                var fullName = _this.generateName(constructedTask.Name);
                if (constructedTasks[fullName] != null) {
                    logger.warn("(" + _this._moduleName + ") Task \"" + fullName + "\" already exist.");
                }
                else {
                    constructedTasks[fullName] = constructedTask;
                    gulp.task(fullName, constructedTask.TaskFunction.bind(_this, false));
                    if (_this.configuration.WithProduction) {
                        gulp.task(fullName + ":Production", constructedTask.TaskFunction.bind(_this, true));
                    }
                }
            });
        }
        else {
            logger.warn("(" + this._moduleName + ") The tasks list is empty.");
        }
        return constructedTasks;
    };
    TasksHandler.prototype.loadTasksHandlers = function (tasksHandlers) {
        if (tasksHandlers != null && tasksHandlers.length > 0) {
            tasksHandlers.forEach(function (handler) {
                new handler();
            });
        }
    };
    TasksHandler.prototype.registerMainTask = function () {
        if (this.configuration.TasksPrefix != null && this.configuration.TasksPrefix.length > 0) {
            var method = (this.configuration.TasksAsync) ? gulp.parallel : gulp.series;
            var tasksList = Object.keys(this.constructedTasks);
            gulp.task(this.configuration.TasksPrefix, method(tasksList));
            if (this.configuration.WithProduction) {
                var tasksListProuction = tasksList.map(function (x) { return x + ":Production"; });
                gulp.task(this.configuration.TasksPrefix + ':Production', method(tasksListProuction));
            }
        }
    };
    TasksHandler.prototype.generateName = function (taskName) {
        var name = taskName;
        if (this.configuration.TasksPrefix != null && this.configuration.TasksPrefix.length > 0) {
            if (name.slice(0, this.configuration.TasksPrefix.length + 1) !== this.configuration.TasksPrefix + ".") {
                name = this.configuration.TasksPrefix + "." + name;
            }
        }
        if (this.configuration.TasksSufix != null && this.configuration.TasksSufix.length > 0) {
            name = name + "." + this.configuration.TasksSufix;
        }
        return name;
    };
    return TasksHandler;
}());

var TaskBase = (function () {
    function TaskBase() {
    }
    return TaskBase;
}());

var DirectoriesBuilder = (function () {
    function DirectoriesBuilder() {
        this.gulpConfig = Configuration.GulpConfig;
        this.Source = this.gulpConfig.Directories.Source;
        this.SourceApp = path.join(this.Source, this.gulpConfig.Directories.App);
        this.Build = this.gulpConfig.Directories.Build;
        this.BuildApp = path.join(this.Build, this.gulpConfig.Directories.App);
    }
    return DirectoriesBuilder;
}());

var BuilderBase = (function () {
    function BuilderBase() {
    }
    BuilderBase.prototype.InSource = function (param) {
        var startPath = Paths$1.Directories.Source;
        return this.builder(startPath, param);
    };
    BuilderBase.prototype.InSourceApp = function (param) {
        var startPath = Paths$1.Directories.SourceApp;
        return this.builder(startPath, param);
    };
    BuilderBase.prototype.InBuild = function (param) {
        var startPath = Paths$1.Directories.Build;
        return this.builder(startPath, param);
    };
    BuilderBase.prototype.InBuildApp = function (param) {
        var startPath = Paths$1.Directories.BuildApp;
        return this.builder(startPath, param);
    };
    return BuilderBase;
}());

var AllFilesBuilder = (function (_super) {
    __extends(AllFilesBuilder, _super);
    function AllFilesBuilder() {
        _super.apply(this, arguments);
    }
    AllFilesBuilder.prototype.builder = function (startPath, name) {
        if (name !== undefined) {
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

var WatchAssetsTask = (function () {
    function WatchAssetsTask() {
        this.Name = "Assets";
        this.Globs = Paths$1.Builders.AllDirectories.InSource("assets");
    }
    WatchAssetsTask.prototype.TaskFunction = function (production, done) {
        console.log("Assets watch task");
        done();
    };
    return WatchAssetsTask;
}());

var WatchConfigsTask = (function () {
    function WatchConfigsTask() {
        this.Name = "Configs";
        this.Globs = Paths$1.Builders.OneDirectory.InSource("configs");
    }
    WatchConfigsTask.prototype.TaskFunction = function (production) {
        console.log("Configs watch task");
    };
    return WatchConfigsTask;
}());

var WatchHtmlTask = (function () {
    function WatchHtmlTask() {
        this.Name = "Html";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".{htm,html}");
    }
    WatchHtmlTask.prototype.TaskFunction = function (production, done) {
        console.log("Html watch task");
        done();
    };
    return WatchHtmlTask;
}());

var WatchScriptsTask = (function () {
    function WatchScriptsTask() {
        this.Name = "Scripts";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".{ts,tsx}");
    }
    WatchScriptsTask.prototype.TaskFunction = function (production) {
        console.log("Scripts watch task");
    };
    return WatchScriptsTask;
}());

var WatchStylesTask = (function () {
    function WatchStylesTask() {
        this.Name = "Styles";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".scss");
    }
    WatchStylesTask.prototype.TaskFunction = function (production) {
        console.log("Styles watch task");
    };
    return WatchStylesTask;
}());

var WatcherTasksHandler = (function (_super) {
    __extends(WatcherTasksHandler, _super);
    function WatcherTasksHandler() {
        _super.call(this, function (config) {
            config.TasksPrefix = "Watch";
            config.Tasks = [WatchAssetsTask, WatchConfigsTask, WatchHtmlTask, WatchScriptsTask, WatchStylesTask];
            return config;
        });
        this.watchers = {};
        this.registerWatchers();
        logger.info("Started watching files in '" + Configuration.GulpConfig.Directories.Source + "' folder.");
    }
    WatcherTasksHandler.prototype.registerWatchers = function () {
        var _this = this;
        Object.keys(this.constructedTasks).forEach(function (name) {
            var task = _this.constructedTasks[name];
            _this.watchers[task.Name] = gulp.watch(task.Globs, gulp.parallel(_this.generateName(task.Name)));
        });
    };
    return WatcherTasksHandler;
}(TasksHandler));

var DefaultTask = (function (_super) {
    __extends(DefaultTask, _super);
    function DefaultTask() {
        _super.apply(this, arguments);
        this.Name = "default";
    }
    DefaultTask.prototype.TaskFunction = function (production, done) {
        console.log("Default task");
        new WatcherTasksHandler();
        done();
    };
    return DefaultTask;
}(TaskBase));

var BuildAssetsTask = (function (_super) {
    __extends(BuildAssetsTask, _super);
    function BuildAssetsTask() {
        _super.apply(this, arguments);
        this.Name = "Build.Assets";
    }
    BuildAssetsTask.prototype.TaskFunction = function (production, done) {
        console.log("Build.Assets");
        done();
    };
    return BuildAssetsTask;
}(TaskBase));

var BuildConfigTask = (function (_super) {
    __extends(BuildConfigTask, _super);
    function BuildConfigTask() {
        _super.apply(this, arguments);
        this.Name = "Build.Configs";
    }
    BuildConfigTask.prototype.TaskFunction = function (production, done) {
        console.log("BUILD CONFIGS:", production);
        console.log("Build.Configs");
        done();
    };
    return BuildConfigTask;
}(TaskBase));

var BuildHtmlTask = (function (_super) {
    __extends(BuildHtmlTask, _super);
    function BuildHtmlTask() {
        _super.apply(this, arguments);
        this.Name = "Build.Html";
    }
    BuildHtmlTask.prototype.TaskFunction = function (production, done) {
        console.log("Build.Html");
        done();
    };
    return BuildHtmlTask;
}(TaskBase));

var BuildScriptsTask = (function (_super) {
    __extends(BuildScriptsTask, _super);
    function BuildScriptsTask() {
        _super.apply(this, arguments);
        this.Name = "Build.Scripts";
    }
    BuildScriptsTask.prototype.TaskFunction = function (production, done) {
        console.log("Build.Scripts");
        done();
    };
    return BuildScriptsTask;
}(TaskBase));

var BuildStylesgTask = (function (_super) {
    __extends(BuildStylesgTask, _super);
    function BuildStylesgTask() {
        _super.apply(this, arguments);
        this.Name = "Build.Styles";
    }
    BuildStylesgTask.prototype.TaskFunction = function (production, done) {
        console.log("Build.Styles");
        done();
    };
    return BuildStylesgTask;
}(TaskBase));

var BuildTasksHandler = (function (_super) {
    __extends(BuildTasksHandler, _super);
    function BuildTasksHandler() {
        _super.call(this, function (config) {
            config.TasksPrefix = "Build";
            config.Tasks = [BuildAssetsTask, BuildConfigTask, BuildHtmlTask, BuildScriptsTask, BuildStylesgTask];
            config.WithProduction = true;
            return config;
        });
    }
    return BuildTasksHandler;
}(TasksHandler));

var WatchTask = (function (_super) {
    __extends(WatchTask, _super);
    function WatchTask() {
        _super.apply(this, arguments);
        this.Name = "Watch";
    }
    WatchTask.prototype.TaskFunction = function (production, done) {
        console.log("Watch task");
        new WatcherTasksHandler();
        done();
    };
    return WatchTask;
}(TaskBase));

var Tasks = (function (_super) {
    __extends(Tasks, _super);
    function Tasks() {
        _super.call(this, function (config) {
            config.Tasks = [DefaultTask, WatchTask];
            config.TasksHandlers = [BuildTasksHandler];
            return config;
        });
    }
    return Tasks;
}(TasksHandler));

Configuration.Init();
new Tasks();