'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var Colors = require('colors/safe');
var path = require('path');
var gulp = require('gulp');
var express = require('express');
var http = require('http');
var child_process = require('child_process');
var connectLiveReload = require('connect-livereload');
var tinyLr = require('tiny-lr');
var through = require('through2');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var filter = require('gulp-filter');
var tslint = _interopDefault(require('gulp-tslint'));
var Lint = require('tslint/lib/lint');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rimraf = require('rimraf');
var jspm = require('jspm');
var https = require('https');
var url = require('url');

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
}

function WriteToFileAsJson(fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content, null, 4));
}
function Pad(num, size) {
    var s = "000000000" + num.toString();
    return s.substr(s.length - size);
}
function GetTimeNow() {
    let date = new Date(), hours = Pad(date.getHours(), 2), minutes = Pad(date.getMinutes(), 2), seconds = Pad(date.getSeconds(), 2);
    return `${hours}:${minutes}:${seconds}`;
}
function GetClassName(constructor) {
    if (constructor != null) {
        let functionString = constructor.toString();
        if (functionString.length > 0) {
            let match = functionString.match(/\w+/g);
            if (match != null && match[1] != null) {
                return match[1];
            }
        }
    }
    return "";
}
function FixSeparator(link) {
    const correctSep = "/";
    let wrongSeps = ["\\"];
    if (path.sep !== correctSep && wrongSeps.indexOf(path.sep) === -1) {
        wrongSeps.push(path.sep);
    }
    for (let i = 0; i < wrongSeps.length; i++) {
        let wrongSep = wrongSeps[i];
        while (link.indexOf(wrongSep) !== -1) {
            link = link.replace(wrongSep, correctSep);
        }
    }
    return link;
}

var LogType;
(function (LogType) {
    LogType[LogType["Default"] = 0] = "Default";
    LogType[LogType["Error"] = 1] = "Error";
    LogType[LogType["Info"] = 2] = "Info";
    LogType[LogType["Warning"] = 3] = "Warning";
})(LogType || (LogType = {}));
class LoggerType {
    constructor(type) {
        this.type = type;
    }
    get Type() {
        return this.type;
    }
}
class Console {
    constructor() {
        this.styles = Colors.styles;
    }
    getTimeNowWithStyles() {
        return `[${this.styles.grey.open}${GetTimeNow()}${this.styles.grey.close}]`;
    }
    showMessage(type, loggerType, ...messages) {
        let typeString = ` ${LogType[type].toLocaleUpperCase()}`;
        let log = console.log;
        let color = this.styles.white.open;
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
        if (loggerType !== undefined) {
            typeString = typeString + " " + loggerType.Type;
        }
        if (log !== console.log) {
            typeString = typeString + ":";
        }
        this.discernWords(type, color, ...messages).then((resolvedMessages) => {
            log(`${this.getTimeNowWithStyles()}${this.styles.bold.open}${color}${typeString}`, ...resolvedMessages, this.styles.reset.open);
        });
    }
    discernWords(type, color, ...messages) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                if (type === LogType.Default || type === LogType.Info) {
                    let resolveMessages = messages.map(message => {
                        if (typeof message === 'string') {
                            let msg = message;
                            let openColor = true;
                            while (msg.search("'") !== -1) {
                                if (openColor) {
                                    openColor = !openColor;
                                    msg = msg.replace("'", this.styles.magenta.open);
                                }
                                else {
                                    openColor = !openColor;
                                    msg = msg.replace("'", color);
                                }
                            }
                            return msg;
                        }
                        return message;
                    });
                    resolve(resolveMessages);
                }
                else {
                    resolve(messages);
                }
            });
        });
    }
    getLoggerTypeFromMessages(messages) {
        return (messages[0] instanceof LoggerType) ? messages.shift() : undefined;
    }
    log(...messages) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Default, loggerType, ...messages);
    }
    error(...messages) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Error, loggerType, ...messages);
    }
    info(...messages) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Info, loggerType, ...messages);
    }
    warn(...messages) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Warning, loggerType, ...messages);
    }
    withType(type) {
        let loggerType = new LoggerType(type);
        return {
            log: this.log.bind(this, loggerType),
            error: this.error.bind(this, loggerType),
            info: this.info.bind(this, loggerType),
            warn: this.warn.bind(this, loggerType)
        };
    }
}
let logger = new Console();

const DEFAULT_TYPESCRIPT_CONFIG = {
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
const DEFAULT_GULP_CONFIG = {
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
        Exclude: ['[app/**/*]']
    },
    WebConfig: null,
    CfgVersion: 2.02
};
const DEFAULT_EXTENSIONS_MAP = {
    "ts": "js",
    "tsx": "js",
    "scss": "css"
};

class ConfigurationLoader {
    constructor() {
        this.tryToReadConfigurationFile();
        this.checkTypeScriptConfigurationFiles();
        this.readPackageJSON();
    }
    Init() { }
    ;
    readPackageJSON() {
        this.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    }
    tryToReadConfigurationFile(cfgFileName = 'gulpconfig') {
        try {
            let config = JSON.parse(fs.readFileSync(`./${cfgFileName}.json`, "utf8"));
            let valid = true;
            if (config.CfgVersion !== DEFAULT_GULP_CONFIG.CfgVersion) {
                logger.warn(`'${cfgFileName}.json' file major version is not valid (v${config.CfgVersion} != v${DEFAULT_GULP_CONFIG.CfgVersion})!`);
                valid = false;
            }
            else if (config.CfgVersion < DEFAULT_GULP_CONFIG.CfgVersion) {
                logger.warn(`'${cfgFileName}.json' file version is too old (v${config.CfgVersion} < v${DEFAULT_GULP_CONFIG.CfgVersion})!`);
                valid = false;
            }
            else {
                this.config = config;
            }
            if (!valid) {
                logger.warn("Creating new file with default configuration.");
                WriteToFileAsJson(`${cfgFileName}-v${config.CfgVersion}.json`, config);
                this.config = DEFAULT_GULP_CONFIG;
                WriteToFileAsJson(`${cfgFileName}.json`, this.config);
            }
        }
        catch (e) {
            this.config = DEFAULT_GULP_CONFIG;
            WriteToFileAsJson(`${cfgFileName}.json`, this.config);
            logger.warn("'gulpconfig.json' was not found or is not valid. Creating default configuration file.");
        }
    }
    checkTypeScriptConfigurationFiles() {
        try {
            if (!fs.statSync(`./${this.config.TypeScriptConfig.Development}`).isFile())
                throw new Error();
        }
        catch (e) {
            let tsConfig = {
                compilerOptions: DEFAULT_TYPESCRIPT_CONFIG.compilerOptions,
                exclude: DEFAULT_TYPESCRIPT_CONFIG.exclude
            };
            tsConfig.exclude.push(this.config.Directories.Build);
            WriteToFileAsJson(this.config.TypeScriptConfig.Development, tsConfig);
            logger.warn(`'${this.config.TypeScriptConfig.Development}' was not found. Creating default TypeScript configuration file.`);
        }
        try {
            if (!fs.statSync(`./${this.config.TypeScriptConfig.Production}`).isFile())
                throw new Error();
        }
        catch (e) {
            let tsConfig = DEFAULT_TYPESCRIPT_CONFIG;
            tsConfig.compilerOptions.inlineSources = false;
            tsConfig.compilerOptions.removeComments = true;
            tsConfig.compilerOptions.sourceMap = false;
            WriteToFileAsJson(this.config.TypeScriptConfig.Production, tsConfig);
            logger.warn(`'${this.config.TypeScriptConfig.Production}' was not found. Creating default TypeScript configuration file.`);
        }
    }
    get GulpConfig() {
        return this.config;
    }
    get DefaultExtensions() {
        return DEFAULT_EXTENSIONS_MAP;
    }
    get Package() {
        return this.packageJson;
    }
}
var Configuration = new ConfigurationLoader();

class TasksHandler {
    constructor(config) {
        this._className = GetClassName(this.constructor);
        this._moduleName = `TasksHandler.${this._className}`;
        this.configuration = config(this.initConfiguration);
        this.constructedTasks = this.registerTasks(this.configuration.Tasks);
        this.constructedTasksHander = this.loadTasksHandlers(this.configuration.TasksHandlers);
        if (this.configuration.HandlerAsTask) {
            this.registerMainTask();
        }
    }
    get TaskName() {
        return this.configuration.Name;
    }
    ;
    get initConfiguration() {
        return {
            Name: "",
            TasksSufix: "",
            Tasks: [],
            TasksHandlers: [],
            TasksAsync: true,
            WithProduction: false,
            HandlerAsTask: true
        };
    }
    registerTasks(tasks) {
        let constructedTasks = {};
        if (tasks != null && tasks.length > 0) {
            tasks.forEach(task => {
                let constructedTask = new task();
                let fullName = this.generateName(constructedTask.Name);
                if (constructedTasks[fullName] != null) {
                    logger.warn(`(${this._moduleName}) Task "${fullName}" already exist.`);
                }
                else {
                    constructedTasks[fullName] = constructedTask;
                    this.registerTaskFunction(fullName, false, constructedTask);
                    if (this.configuration.WithProduction) {
                        this.registerTaskFunction(`${fullName}:Production`, true, constructedTask);
                    }
                }
            });
        }
        else {
            logger.warn(`(${this._moduleName}) The tasks list is empty.`);
        }
        return constructedTasks;
    }
    registerTaskFunction(name, production, constructedTask) {
        let func = (done) => {
            let taskRunner = constructedTask.TaskFunction(production, done);
            if (taskRunner !== undefined) {
                if (taskRunner instanceof Promise) {
                    taskRunner.then(() => {
                        done();
                    });
                }
                else {
                    return taskRunner;
                }
            }
        };
        func.displayName = name;
        if (constructedTask.Description != null && !production) {
            func.description = "# " + constructedTask.Description;
        }
        gulp.task(func);
    }
    loadTasksHandlers(tasksHandlers) {
        let constructedTasksHander = {};
        if (tasksHandlers != null && tasksHandlers.length > 0) {
            tasksHandlers.forEach(handler => {
                let taskHandler = new handler();
                let fullName = taskHandler.TaskName;
                if (constructedTasksHander[fullName] != null) {
                    logger.warn(`(${this._moduleName}) Task handler "${fullName}" already exist.`);
                }
                else {
                    constructedTasksHander[fullName] = taskHandler;
                }
            });
        }
        return constructedTasksHander;
    }
    registerMainTask() {
        if (this.configuration.Name != null && this.configuration.Name.length > 0) {
            let method = (this.configuration.TasksAsync) ? gulp.parallel : gulp.series;
            let tasksList = Object.keys(this.constructedTasks).concat(Object.keys(this.constructedTasksHander));
            gulp.task(this.configuration.Name, method(tasksList));
            if (this.configuration.WithProduction) {
                let tasksListProduction = tasksList.map(x => { return `${x}:Production`; });
                gulp.task(this.configuration.Name + ':Production', method(tasksListProduction));
            }
        }
    }
    generateName(taskName) {
        let name = taskName;
        if (this.configuration.Name != null && this.configuration.Name.length > 0) {
            if (name.slice(0, this.configuration.Name.length + 1) !== `${this.configuration.Name}.`) {
                name = `${this.configuration.Name}.${name}`;
            }
        }
        if (this.configuration.TasksSufix != null && this.configuration.TasksSufix.length > 0) {
            name = `${name}.${this.configuration.TasksSufix}`;
        }
        return name;
    }
}

class TaskBase {
}

class ReloadFiles {
    constructor(filesNames) {
        this.filesNames = filesNames;
    }
    get FilesNames() {
        return this.filesNames;
    }
}
class ReloadPage {
    constructor() {
    }
}

class ActionsEmitter {
    constructor() {
        this.listeners = new Array();
        this.uniqId = 0;
    }
    get UniqueId() {
        return this.uniqId++;
    }
    On(action, callback) {
        let id = this.UniqueId;
        this.listeners[id] = { Action: action, Callback: callback };
        return { remove: this.removeListener.bind(this, id) };
    }
    removeListener(id) {
        delete this.listeners[id];
        let tempListeners = this.listeners.filter(x => x !== undefined);
        if (tempListeners.length === 0) {
            this.listeners = tempListeners;
            this.uniqId = 0;
        }
    }
    Emit(action) {
        this.listeners.forEach((listener) => {
            if (action instanceof listener.Action) {
                listener.Callback(action);
            }
            else if (listener.Action === "*") {
                listener.Callback(action);
            }
        });
    }
}
var ActionsEmitter$1 = new ActionsEmitter();

class LiveReloadActionsCreators {
    constructor() {
        this.reloadFiles = [];
        this.emitOnDebounced = () => {
            if (this.reloadFiles !== undefined) {
                ActionsEmitter$1.Emit(new ReloadFiles(this.reloadFiles));
            }
            else {
                ActionsEmitter$1.Emit(new ReloadPage());
            }
            this.reloadFiles = [];
            this.tryToClearTimer();
        };
    }
    tryToClearTimer() {
        let result = false;
        if (this.timer !== undefined) {
            result = true;
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        return result;
    }
    setTimer(func) {
        this.timer = setTimeout(func, 300);
    }
    ReloadPage() {
        this.tryToClearTimer();
        this.setTimer(this.emitOnDebounced);
    }
    ReloadFiles(...filesNames) {
        this.tryToClearTimer();
        if (this.reloadFiles !== undefined) {
            this.reloadFiles = this.reloadFiles.concat(filesNames);
        }
        this.setTimer(this.emitOnDebounced);
    }
}
var LiveReloadActionsCreators$1 = new LiveReloadActionsCreators();

class WatchTaskBase extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Description = "Watch source files and start tasks";
        this.TaskFunction = (production, done) => {
            let taskName = `${this.TaskNamePrefix}.${this.Name}`;
            if (production) {
                taskName = this.addTasksProductionSuffix(taskName);
            }
            return gulp.parallel(this.getStarterFunction(taskName), taskName)(() => {
                this.emit("end");
                done();
            });
        };
        this.listeners = {};
        this.uniqId = 0;
    }
    getStarterFunction(taskName) {
        let func = (done) => {
            this.emit("start");
            done();
        };
        func.displayName = taskName + ".Starter";
        return func;
    }
    addTasksProductionSuffix(text) {
        return text + ":Production";
    }
    get UniqueId() {
        return this.uniqId++;
    }
    On(eventName, callback) {
        let id = this.UniqueId;
        this.listeners[id] = { Callback: callback, Event: eventName };
        return { remove: this.removeListener.bind(this, id) };
    }
    emit(eventName, ...params) {
        Object.keys(this.listeners).forEach(key => {
            let listener = this.listeners[key];
            if (listener.Event === eventName) {
                listener.Callback(params);
            }
        });
    }
    removeListener(id) {
        if (this.listeners[id] != null) {
            delete this.listeners[id];
        }
    }
}

class DirectoriesBuilder {
    constructor() {
        this.gulpConfig = Configuration.GulpConfig;
        this.Source = this.gulpConfig.Directories.Source;
        this.SourceApp = [this.Source, this.gulpConfig.Directories.App].join("/");
        this.Build = this.gulpConfig.Directories.Build;
        this.BuildApp = [this.Build, this.gulpConfig.Directories.App].join("/");
    }
}

class BuilderBase {
    InSource(param) {
        let startPath = Paths$1.Directories.Source;
        return this.builder(startPath, param);
    }
    InSourceApp(param) {
        let startPath = Paths$1.Directories.SourceApp;
        return this.builder(startPath, param);
    }
    InBuild(param) {
        let startPath = Paths$1.Directories.Build;
        return this.builder(startPath, param);
    }
    InBuildApp(param) {
        let startPath = Paths$1.Directories.BuildApp;
        return this.builder(startPath, param);
    }
    joinPaths(...pathsList) {
        return pathsList.join("/");
    }
}

class AllFilesBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name !== undefined) {
            return this.joinPaths(startPath, '**', '*' + name);
        }
        else {
            return this.joinPaths(startPath, '**', '*');
        }
    }
}

class OneFileBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name !== undefined) {
            return this.joinPaths(startPath, name);
        }
        else {
            return startPath;
        }
    }
}

class AllDirectoriesBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name !== undefined) {
            return this.joinPaths(startPath, "**", name, "**", "*");
        }
        else {
            return this.joinPaths(startPath, "**", "*");
        }
    }
}

class OneDirectoryBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name != null) {
            return this.joinPaths(startPath, name);
        }
        else {
            return startPath;
        }
    }
}

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

class WatchAssetsTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.TaskNamePrefix = "Build";
        this.Name = "Assets";
        this.Globs = Paths$1.Builders.AllDirectories.InSource("assets");
    }
}

class WatchConfigsTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.TaskNamePrefix = "Build";
        this.Name = "Configs";
        this.Globs = Paths$1.Builders.OneDirectory.InSource("configs");
    }
}

class WatchHtmlTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.TaskNamePrefix = "Build";
        this.Name = "Html";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".{htm,html}");
    }
}

class WatchScriptsTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.TaskNamePrefix = "Build";
        this.Name = "Scripts";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".{ts,tsx}");
    }
}

class WatchStylesTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Styles";
        this.TaskNamePrefix = "Build";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".scss");
    }
}

class WatcherTasksHandler extends TasksHandler {
    constructor() {
        super((config) => {
            config.Name = "Watch";
            config.Tasks = [WatchAssetsTask, WatchConfigsTask, WatchHtmlTask, WatchScriptsTask, WatchStylesTask];
            return config;
        });
        this.watchers = {};
        this.runningTasks = new Array();
        this.onTaskStart = (taskName) => {
            this.runningTasks.push(taskName);
        };
        this.onTaskEnd = (taskName) => {
            let found = this.runningTasks.indexOf(taskName);
            if (found > -1) {
                this.runningTasks.splice(found, 1);
            }
            if (this.runningTasks.length === 0) {
                this.onAllTaskEnded();
            }
        };
        this.pendingReloadFiles = new Array();
        this.fileChangeHandler = (pathName, stats) => {
            let targetPathName = this.removeRootSourcePath(pathName);
            targetPathName = this.changeExtensionToBuilded(targetPathName);
            this.pendingReloadFiles.push(targetPathName);
            logger.log(`'${pathName}' was changed.`);
        };
        this.fileUnlinkHandler = (pathName) => {
            let targetPathName = this.changeExtensionToBuilded(pathName);
            targetPathName = this.changeRootPathToBuild(targetPathName);
            fs.unlink(targetPathName, (err) => {
                if (err != null) {
                    if (err.code === "ENOENT") {
                        logger.warn(`'${targetPathName}' has already been deleted.`);
                    }
                    else {
                        logger.error(`Failed to delete file '${targetPathName}'\n`, err);
                    }
                }
                else {
                    logger.log(`'${targetPathName}' was deleted successfully.`);
                }
            });
        };
        this.registerWatchers();
        logger.info(`Started watching files in '${Configuration.GulpConfig.Directories.Source}' folder.`);
    }
    registerWatchers() {
        Object.keys(this.constructedTasks).forEach(name => {
            let task = this.constructedTasks[name];
            let process = gulp.parallel(this.generateName(task.Name));
            this.watchers[task.Name] = gulp.watch(task.Globs, process);
            this.watchers[task.Name].on('unlink', this.fileUnlinkHandler);
            this.watchers[task.Name].on('change', this.fileChangeHandler);
            task.On("start", this.onTaskStart.bind(this, task.Name));
            task.On("end", this.onTaskEnd.bind(this, task.Name));
        });
    }
    onAllTaskEnded() {
        LiveReloadActionsCreators$1.ReloadFiles(...this.pendingReloadFiles);
        this.pendingReloadFiles = new Array();
    }
    removeRootSourcePath(pathName) {
        let pathList = pathName.split(path.sep);
        if (pathList[0] === Configuration.GulpConfig.Directories.Source) {
            pathList[0] = "";
            return path.join(...pathList);
        }
        else {
            return pathName;
        }
    }
    changeExtensionToBuilded(pathName) {
        let currentExtension = path.extname(pathName);
        if (currentExtension.length > 1) {
            let currentExtensionTarget = currentExtension.slice(1);
            let targetExtension = Configuration.DefaultExtensions[currentExtensionTarget];
            if (targetExtension !== undefined) {
                return pathName.slice(0, -currentExtensionTarget.length) + targetExtension;
            }
        }
        return pathName;
    }
    changeRootPathToBuild(pathName) {
        let pathList = pathName.split(path.sep);
        if (pathList[0] === Configuration.GulpConfig.Directories.Source) {
            pathList[0] = Configuration.GulpConfig.Directories.Build;
            return path.join(...pathList);
        }
        else {
            logger.warn(`WarcherTasksHandler.changeRootPathToBuild(): "${pathName}" path root is not under Source directory (${Configuration.GulpConfig.Directories.Source}) `);
            return pathName;
        }
    }
}

class ServerStarter {
    constructor() {
        this.server = express();
        this.liveReloadServer = tinyLr({});
        this.actionsListeners = new Array();
        this.onReloadFilesList = (action) => {
            this.reloadFiles(action.FilesNames.join(","));
        };
        this.onReloadPage = (action) => {
            this.reloadFiles("index.html");
        };
        this.onRequest = (req, res) => {
            let { Build } = Configuration.GulpConfig.Directories;
            res.sendFile('index.html', { root: Build });
        };
        this.onClose = () => {
            logger.info(`Server closed.`);
            this.removeActionsListeners();
        };
        this.onError = (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`Port ${Configuration.GulpConfig.ServerConfig.Port} already in use.`);
                this.Listener.close();
            }
            else {
                logger.error(`Exeption not handled. Please create issues with error code "${err.code}" here: https://github.com/QuatroCode/simplr-gulp/issues \n`, err);
            }
        };
        let { ServerConfig, Directories } = Configuration.GulpConfig;
        let serverUrl = `http://${ServerConfig.Ip}:${ServerConfig.Port}`;
        this.configureServer(Directories.Build);
        this.startListeners(ServerConfig.Port, ServerConfig.LiveReloadPort);
        this.addEventListeners();
        this.openBrowser(serverUrl);
        logger.info(`Server started at '${serverUrl}'`);
        this.addActionsListeners();
    }
    get isQuiet() {
        return (process.argv.findIndex(x => x === "--quiet") !== -1 || process.argv.findIndex(x => x === "-Q") !== -1);
    }
    addActionsListeners() {
        this.actionsListeners.push(ActionsEmitter$1.On(ReloadFiles, this.onReloadFilesList));
        this.actionsListeners.push(ActionsEmitter$1.On(ReloadPage, this.onReloadPage));
    }
    removeActionsListeners() {
        this.actionsListeners.forEach(x => { x.remove(); });
        this.actionsListeners = new Array();
    }
    reloadFiles(files) {
        http.get({
            hostname: Configuration.GulpConfig.ServerConfig.Ip,
            port: Configuration.GulpConfig.ServerConfig.LiveReloadPort,
            path: `/changed?files=${files}`,
            agent: false
        });
    }
    configureServer(wwwroot) {
        this.server.use(connectLiveReload({ port: Configuration.GulpConfig.ServerConfig.LiveReloadPort }));
        this.server.use(express.static(wwwroot));
    }
    startListeners(serverPort, liveReloadServerPort) {
        this.Listener = this.server.listen(serverPort);
        this.liveReloadServer.listen(liveReloadServerPort);
    }
    openBrowser(serverUrl) {
        if (!this.isQuiet) {
            child_process.spawn('explorer', [serverUrl]);
        }
    }
    addEventListeners() {
        this.Listener.once("close", this.onClose);
        this.Listener.once('error', this.onError);
        this.server.all('/*', this.onRequest);
    }
}

class DefaultTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "default";
        this.Description = "Build and start Watch with Server tasks.";
        this.TaskFunction = (production, done) => {
            if (this.startWithoutBuild) {
                this.startWatcherWithServer(done);
            }
            else {
                gulp.parallel("Build")(() => {
                    this.startWatcherWithServer(done);
                });
            }
        };
    }
    startWatcherWithServer(done) {
        new WatcherTasksHandler();
        new ServerStarter();
        done();
    }
    get startWithoutBuild() {
        return (process.argv.findIndex(x => x === "--no-build") !== -1);
    }
}

class BuildAssetsTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Assets";
        this.Description = "Copies all assets folders and their contents from source to build directory";
        this.TaskFunction = (production, done) => {
            gulp.src(Paths$1.Builders.AllDirectories.InSource("assets"))
                .pipe(gulp.dest(Paths$1.Directories.Build))
                .on("end", done);
        };
    }
}

class BuildConfigsFilesTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Configs.Files";
        this.Description = "Copy `jspm.config.js` file from source to build directory with production enviroment (production only)";
        this.TaskFunction = (production, done) => {
            let tasks = new Array();
            if (production) {
                let jspmConfigFileName = this.readJspmConfigFileName();
                let task = this.prepareJspmConfigForProduction.bind(this, jspmConfigFileName);
                task.displayName = this.Name + ".JspmConfigForProduction";
                tasks.push(task);
                return gulp.parallel(tasks)(done);
            }
            else {
                done();
            }
        };
    }
    readJspmConfigFileName() {
        if (Configuration.Package != null) {
            let jspmConfig = Configuration.Package['jspm'];
            if (jspmConfig != null) {
                let file = jspmConfig['configFile'];
                if (file != null) {
                    return file;
                }
                else {
                    let configFiles = jspmConfig['configFiles'];
                    if (configFiles != null) {
                        file = configFiles['jspm'];
                        if (file != null) {
                            return file;
                        }
                    }
                }
            }
        }
    }
    prepareJspmConfigForProduction(source) {
        return gulp.src(source)
            .pipe(this.setSystemJSConfigProductionEnviroment(source))
            .pipe(gulp.dest(Paths$1.Builders.OneDirectory.InBuild("configs")));
    }
    setSystemJSConfigProductionEnviroment(fullFileName) {
        return through.obj((file, encoding, callback) => {
            let content = file.contents.toString();
            if (content.length > 0) {
                var regex = /SystemJS\.config\(({[\s\S.]*?})\)/;
                var json = content.match(regex);
                if (json != null) {
                    let jsonObj = undefined;
                    try {
                        eval('jsonObj = ' + json[1]);
                        if (jsonObj != null) {
                            jsonObj['production'] = true;
                            let resultString = JSON.stringify(jsonObj, null, 4);
                            resultString = `SystemJS.config(${resultString})`;
                            let result = content.replace(new RegExp(regex), resultString);
                            file.contents = new Buffer(result, 'utf8');
                        }
                        else {
                            logger.error(`'${fullFileName}': SystemJS.config not found.`);
                        }
                    }
                    catch (error) {
                        logger.error(`'${fullFileName}' file content is not valid.`);
                        logger.error(error);
                    }
                }
                else {
                    logger.warn(`'${fullFileName}' file content is not valid.`);
                }
            }
            else {
                logger.warn(`'${fullFileName}' file content is empty.`);
            }
            callback(null, file);
        });
    }
}

class BuildConfigsFoldersTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Configs.Folders";
        this.Description = "Copies configs folder from source to build directory";
        this.TaskFunction = (production) => {
            return gulp.src(Paths$1.Builders.OneDirectory.InSource(["configs", "**", "*"].join("/")))
                .pipe(gulp.dest(path.join(Paths$1.Directories.Build, "configs")));
        };
    }
}

class Tasks$1 extends TasksHandler {
    constructor() {
        super(config => {
            config.Name = "Build.Configs";
            config.Tasks = [BuildConfigsFoldersTask, BuildConfigsFilesTask];
            config.WithProduction = true;
            config.TasksAsync = false;
            return config;
        });
    }
}

class BuildHtmlTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Html";
        this.Description = "Copies all *.html and *.htm files from source to build directory";
        this.TaskFunction = (production, done) => {
            gulp.src(Paths$1.Builders.AllFiles.InSource(".{htm,html}"))
                .pipe(gulp.dest(Paths$1.Directories.Build))
                .on("end", done);
        };
    }
}

class BuilderBase$1 {
    constructor() {
        this.builders = {
            Production: undefined,
            Development: undefined
        };
    }
    Build(production, done) {
        let compiler = this.getBuilder(production);
        let maybePromise = this.build(production, compiler, done);
        if (maybePromise !== undefined) {
            maybePromise.then(() => {
                done();
            }, error => {
                logger.error(error);
                done();
            });
        }
    }
    getBuilder(production) {
        if (production) {
            if (this.builders.Production === undefined) {
                this.builders.Production = this.initBuilder(production);
            }
            return this.builders.Production;
        }
        else {
            if (this.builders.Development === undefined) {
                this.builders.Development = this.initBuilder(production);
            }
            return this.builders.Development;
        }
    }
}

class ErrorHandler extends Lint.Formatters.AbstractFormatter {
    format(failures) {
        let lines = new Array();
        failures.forEach(failure => {
            let position = failure.getStartPosition().getLineAndCharacter();
            let line = `${failure.getFileName()}[${position.line + 1}, ${position.character + 1}]: ${failure.getFailure()} (${failure.getRuleName()})`;
            lines.push(line);
            logger.warn(line);
        });
        return JSON.stringify(lines);
    }
}

class TypescriptBuilderCompiler {
    constructor(configFile) {
        this.Project = this.createTsProject(configFile);
        let tsConfig = this.Project.config;
        this.setConfig(tsConfig);
    }
    setConfig(tsConfig) {
        this.Config = {};
        this.Config.RootDir = this.generateRootDir(tsConfig.compilerOptions['rootDir']);
        this.Config.OutDir = this.generateOutDir(tsConfig.compilerOptions['outDir']);
        this.Config.Include = this.generateInclude(tsConfig.include, this.Config.RootDir);
        this.Config.Exclude = this.generateExclude(tsConfig.exclude);
        this.Config.Src = this.generateSrc(this.Config.Include, this.Config.Exclude);
    }
    createTsProject(configFile) {
        let requiredTypescript = require("typescript");
        logger.withType("TS").info(`Using Typescript@${requiredTypescript.version}`);
        return ts.createProject(configFile, {
            typescript: requiredTypescript
        });
    }
    generateSrc(include, exclude) {
        let results = include;
        if (exclude != null) {
            results = results.concat(exclude);
        }
        return results.map(src => {
            return FixSeparator(src);
        });
    }
    generateInclude(include, rootDir) {
        let results;
        if (include != null) {
            let resultInclude = include.map(inc => {
                if (inc !== undefined) {
                    if (path.extname(inc).length === 0) {
                        return this.addAvailableTsExtensions(inc);
                    }
                    else {
                        return inc;
                    }
                }
            }).filter(x => x != null);
            resultInclude = resultInclude.map(src => {
                return FixSeparator(src);
            });
            if (resultInclude.indexOf(rootDir) === -1) {
                resultInclude.push(rootDir);
            }
            results = resultInclude;
        }
        else {
            results = [FixSeparator(rootDir)];
        }
        return results;
    }
    generateExclude(exclude) {
        if (exclude != null) {
            let tempExclude = exclude.map(exc => {
                if (exc !== undefined) {
                    return `!${exc}`;
                }
            });
            if (tempExclude.length > 0) {
                let resultInclude = tempExclude.filter(x => x != null);
                if (tempExclude.length > 0) {
                    return resultInclude;
                }
            }
        }
        return undefined;
    }
    generateRootDir(rootDir) {
        if (rootDir != null) {
            return [rootDir, "**", `*${this.addAvailableTsExtensions()}`].join("/");
        }
        else {
            return Paths$1.Builders.AllFiles.InSource(this.addAvailableTsExtensions());
        }
    }
    generateOutDir(outDir) {
        return outDir || Paths$1.Directories.Build;
    }
    addAvailableTsExtensions(name = "") {
        return name + ".{ts,tsx}";
    }
}

class Reporter {
    error(error) {
        if (error.tsFile) {
            let fileName = error.relativeFilename || error.tsFile.fileName;
            fileName = path.normalize(fileName);
            let messageText = (typeof error.diagnostic.messageText === "string") ? error.diagnostic.messageText : error.diagnostic.messageText.messageText;
            logger.withType("TS").error(`${fileName}[${error.startPosition.line}, ${error.startPosition.character}]: `, messageText);
        }
        else {
            logger.withType("TS").error(error.message);
        }
    }
}
class TypescriptBuilder extends BuilderBase$1 {
    constructor(...args) {
        super(...args);
        this.reporter = new Reporter();
    }
    build(production, builder, done) {
        let tsFilter = filter(["**/*", "!**/*.d.ts"], { restore: true });
        let tsSrc = gulp.src(builder.Config.Src);
        let tsResult = tsSrc.pipe(tsFilter)
            .pipe(tslint({
            formatter: ErrorHandler
        }))
            .pipe(tsFilter.restore);
        if (!production) {
            tsResult = tsResult.pipe(sourcemaps.init());
        }
        tsResult = tsResult.pipe(ts(builder.Project, undefined, this.reporter)).js;
        tsResult.pipe((production) ? uglify({ mangle: true }) : sourcemaps.write())
            .pipe(gulp.dest(builder.Config.OutDir))
            .on("end", done);
    }
    initBuilder(production) {
        if (production) {
            return new TypescriptBuilderCompiler(this.typescriptConfig.Production);
        }
        else {
            return new TypescriptBuilderCompiler(this.typescriptConfig.Development);
        }
    }
    get directories() {
        return Configuration.GulpConfig.Directories;
    }
    get typescriptConfig() {
        return Configuration.GulpConfig.TypeScriptConfig;
    }
}
var TypescriptBuilder$1 = new TypescriptBuilder();

class BuildScriptsTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Scripts";
        this.Description = "Compiles TypeScript from source to build directory";
        this.TaskFunction = (production, done) => {
            TypescriptBuilder$1.Build(production, done);
        };
    }
}

class StylesBuilder extends BuilderBase$1 {
    build(production, builder, done) {
        let sassResults = gulp.src(Paths$1.Builders.AllFiles.InSourceApp(".scss"));
        if (!production) {
            sassResults = sassResults.pipe(sourcemaps.init());
        }
        sassResults = sassResults
            .pipe(sass()
            .on('error', (error) => {
            this.errorHandler(error);
            done();
        }));
        sassResults = sassResults.pipe(autoprefixer());
        if (!production) {
            sassResults = sassResults.pipe(sourcemaps.write());
        }
        else {
            sassResults = sassResults.pipe(cleanCSS({ processImportFrom: ['local'] }));
        }
        sassResults.pipe(gulp.dest(Paths$1.Directories.BuildApp))
            .on('end', done);
    }
    errorHandler(error) {
        if (error != null) {
            if (error.relativePath != null && error.line != null && error.column != null && error.messageOriginal != null) {
                logger.withType("SCSS").error(`${error.relativePath}[${error.line}, ${error.column}]: ${error.messageOriginal}`);
            }
            else {
                logger.error("Error in 'gulp-sass' plugin: \n", error);
            }
        }
        else {
            logger.error(`Unknown error in 'gulp-sass' plugin.`);
        }
    }
    initBuilder(production) {
        return null;
    }
}
var StylesBuilder$1 = new StylesBuilder();

class BuildStylesgTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Styles";
        this.Description = "Compiles *.scss files from source to build directory";
        this.TaskFunction = (production, done) => {
            StylesBuilder$1.Build(production, done);
        };
    }
}

class BuildTasksHandler extends TasksHandler {
    constructor() {
        super(config => {
            config.Name = "Build";
            config.Tasks = [BuildAssetsTask, BuildHtmlTask, BuildScriptsTask, BuildStylesgTask];
            config.TasksHandlers = [Tasks$1];
            config.WithProduction = true;
            return config;
        });
    }
}

class WatchTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Watch";
        this.Description = "Watch source files and start tasks";
        this.TaskFunction = (production, done) => {
            new WatcherTasksHandler();
            done();
        };
    }
}

class CleanAllTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Clean.All";
        this.Description = "Cleans build directory (wwwroot by default)";
        this.TaskFunction = (production, done) => {
            let ignoreLibsPath = [Paths$1.Directories.Build, "**", ".gitkeep"].join("/");
            rimraf(Paths$1.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreLibsPath } }, (error) => {
                done();
            });
        };
    }
}

class CleanTasksHandler extends TasksHandler {
    constructor() {
        super(config => {
            config.Name = "Clean";
            config.Tasks = [CleanAllTask];
            config.HandlerAsTask = false;
            return config;
        });
    }
}

class CleanTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Clean";
        this.Description = "Cleans build directory (wwwroot by default) without wwwroot/libs folder";
        this.TaskFunction = (production, done) => {
            let ignoreGlob = [
                [Paths$1.Directories.Build, "libs/**"].join("/"),
                [Paths$1.Directories.Build, "**/.gitkeep"].join("/")
            ];
            rimraf(Paths$1.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreGlob } }, (error) => {
                done();
            });
        };
    }
}

class CleanBundleTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Clean.Bundle";
        this.Description = "Remove build file (build.js by default) from build directory (wwwroot by default)";
        this.TaskFunction = (production, done) => {
            rimraf(Paths$1.Builders.OneFile.InBuild(Configuration.GulpConfig.BundleConfig.BuildFile), (error) => {
                done();
            });
        };
    }
}

class CleanLibsTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Clean.Libs";
        this.Description = "Cleans libs directory (wwwroot/libs by default)";
        this.TaskFunction = (production, done) => {
            let ignoreLibsPath = [Paths$1.Directories.Build, "**", ".gitkeep"].join("/");
            rimraf(path.join(Paths$1.Directories.Build, "libs", "**", "*"), { glob: { ignore: ignoreLibsPath } }, (error) => {
                done();
            });
        };
    }
}

class BundleTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Bundle";
        this.Description = "Bundles the app libs with jspm bundle";
        this.TaskFunction = (production, done) => {
            let { BundleConfig } = Configuration.GulpConfig;
            let appFile = path.join(Configuration.GulpConfig.Directories.App, BundleConfig.AppFile).split(path.sep).join("/");
            let bundleCmd = appFile, buildDest = Paths$1.Builders.OneFile.InBuild(BundleConfig.BuildFile);
            for (let i = 0; i < BundleConfig.Include.length; i++) {
                bundleCmd += ` + ${BundleConfig.Include[i]}`;
            }
            for (let i = 0; i < BundleConfig.Exclude.length; i++) {
                bundleCmd += ` - ${BundleConfig.Exclude[i]}`;
            }
            bundleCmd += ` - [app/**/*.css!]`;
            let builder = new jspm.Builder();
            logger.log(`jspm bundle ${bundleCmd} ${buildDest}`);
            builder.bundle(bundleCmd, {
                minify: true,
                mangle: true
            }).then((output) => {
                fs.writeFileSync(buildDest, output.source);
                done();
            }).catch((e) => {
                done();
                logger.info("Please make sure that you have installed jspm packages ('jspm install')");
                throw e;
            });
        };
    }
}

const CDN_API = {
    Hostname: "api.cdnjs.com",
    Pathname: "libraries",
    Query: { fields: "assets,version", search: undefined }
};
class JspmCdnPaths {
    Start(done) {
        return __awaiter(this, void 0, void 0, function* () {
            let packagesList = this.getPackagesList();
            let results = yield this.startDownload(packagesList);
            if (results != null && Object.keys(results).length !== 0) {
                yield this.saveResultToFile(results.Paths);
            }
            this.printResults(results);
            done();
        });
    }
    printResults(results) {
        let logger$$ = logger.withType("JSPM");
        if (results.Resolved.length > 0) {
            logger$$.info([`Successfully resolved ${results.Resolved.length} path${(results.Resolved.length > 1) ? "s" : ""}:`]
                .concat(results.Resolved.map((item, index) => {
                return `${this.resultPrefix(index, results.Resolved.length)} ${item.FullName}: '${results.Paths[item.FullName]}'`;
            }))
                .join("\r\n"));
        }
        if (results.Unresolved.length > 0) {
            logger$$.warn([`Failed to resolved ${results.Unresolved.length} path${(results.Unresolved.length > 1) ? "s" : ""}:`]
                .concat(results.Unresolved.map((item, index) => {
                return `${this.resultPrefix(index, results.Unresolved.length)} ${item.FullName}`;
            }))
                .join("\r\n"));
        }
    }
    resultPrefix(index, itemsLength) {
        return `\t\t\t ${(index === itemsLength - 1) ? "└─" : "├─"}`;
    }
    saveResultToFile(paths) {
        return __awaiter(this, void 0, void 0, function* () {
            let logger$$ = logger.withType("JSPM");
            return new Promise(resolve => {
                let pathname = [Paths$1.Directories.Source, "configs", "jspm.config.production.js"].join("/");
                logger$$.info(`Generating file '${pathname}'`);
                let data = [
                    "/* Generated by simplr-gulp */",
                    "SystemJS.config({",
                    "    paths: " + JSON.stringify(paths, null, 4),
                    "});"
                ].join("\r\n");
                fs.writeFile(pathname, data, (err) => {
                    if (err) {
                        logger$$.error(err.message);
                    }
                    resolve();
                });
            });
        });
    }
    startDownload(packagesList, results = { Resolved: [], Unresolved: [], Paths: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (packagesList.length > 0) {
                    let item = packagesList.shift();
                    let cdnLink = yield this.getCdnLink(item);
                    if (cdnLink !== undefined) {
                        results.Resolved.push(item);
                        results.Paths[item.FullName] = cdnLink.replace(/^https?\:/i, "");
                    }
                    else {
                        results.Unresolved.push(item);
                    }
                    resolve(yield this.startDownload(packagesList, results));
                }
                else {
                    resolve(results);
                }
            }));
        });
    }
    getCdnLink(packageItem, splited = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                let logger$$ = logger.withType(`JSPM [${packageItem.FullName}]`);
                let requestDetails = {
                    protocol: "https:",
                    hostname: CDN_API.Hostname,
                    pathname: CDN_API.Pathname,
                    query: CDN_API.Query
                };
                requestDetails.query.search = packageItem.Details.Name;
                let path = url.format(requestDetails);
                logger$$.info(`Downloading '${path}'`);
                let request = https.get(path, response => {
                    logger$$.info(`Response '${response.statusCode}' (${response.statusMessage}).`);
                    let allData = "";
                    response.on("data", (data) => {
                        allData += data;
                    });
                    response.on('end', () => __awaiter(this, void 0, void 0, function* () {
                        let parsedJson;
                        try {
                            parsedJson = JSON.parse(allData);
                        }
                        catch (err) {
                            logger$$.error(`Sorry, something wrong with response data from ${CDN_API.Hostname}. Please report a bug.`);
                        }
                        ;
                        if (parsedJson !== undefined) {
                            logger$$.info(`Downloaded and parsed '${parsedJson.total}' result${(parsedJson.total > 1) ? 's' : ''}.`);
                            if (parsedJson.total > 0) {
                                let link = yield this.getLinkFromResponseByVersion(packageItem, parsedJson, splited);
                                if (link !== undefined) {
                                    logger$$.info(`Cdn link successfully resolved.`);
                                    logger$$.info(`'${link}'`);
                                }
                                else {
                                    logger$$.warn(`Cannot resolve cdn link with version ${packageItem.Details.Version}.`);
                                }
                                resolve(link);
                            }
                            else {
                                if (!splited) {
                                    let splitedName = this.tryToSplitPackageName(packageItem.Details.Name);
                                    if (splitedName !== undefined) {
                                        logger$$.info(`Trying to use splited package name: '${splitedName}'`);
                                        let splitedPackageItem = {
                                            FullName: packageItem.FullName,
                                            MapName: packageItem.MapName,
                                            Details: {
                                                OriginalName: packageItem.Details.Name,
                                                Name: splitedName,
                                                Version: packageItem.Details.Version
                                            }
                                        };
                                        let link = this.getCdnLink(splitedPackageItem, true);
                                        resolve(link);
                                    }
                                    else {
                                        resolve(undefined);
                                    }
                                }
                                else {
                                    resolve(undefined);
                                }
                            }
                        }
                        else {
                            resolve(undefined);
                        }
                    }));
                });
                request.on('error', (err) => {
                    logger$$.error(err.message);
                    resolve(undefined);
                });
            });
        });
    }
    tryToResolveSplitedPackage(packageItem, assetIndex, found, link = undefined) {
        let logger$$ = logger.withType(`JSPM [${packageItem.FullName}]`);
        let asset = found.assets[assetIndex];
        let searchingFiles = new Array();
        let originalName = (packageItem.Details.OriginalName || packageItem.Details.Name).toLowerCase();
        searchingFiles.push(`${originalName}.min.js`);
        searchingFiles.push(`${originalName}.js`);
        let foundFile = searchingFiles.find(searchingFile => asset.files.findIndex(file => searchingFile === file) !== -1);
        if (foundFile !== undefined) {
            logger$$.info(`File '${foundFile}' found in '${found.name}@${asset.version}'`);
            return this.buildCdnLinkWithCustomFile(link || found.latest, foundFile);
        }
        return undefined;
    }
    tryToSplitPackageName(name) {
        let splited = name.split("-");
        if (splited.length === 2) {
            return splited[0];
        }
        return undefined;
    }
    checkIfFileExist(files, link, fileName) {
        let resultObj = {
            Found: false,
            Link: link
        };
        files.forEach(originalName => {
            if (originalName === fileName) {
                resultObj.Found = true;
                return false;
            }
            else if (originalName.toLocaleLowerCase() === fileName) {
                resultObj.Found = true;
                let parsedFile = path.parse(link);
                resultObj.Link = parsedFile.dir + "/" + originalName;
                return false;
            }
        });
        return resultObj;
    }
    getLinkFromResponseByVersion(packageItem, responseDto, splited) {
        return __awaiter(this, void 0, void 0, function* () {
            let logger$$ = logger.withType(`JSPM [${packageItem.FullName}]`);
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let found = responseDto.results.find(x => x.name === packageItem.Details.Name);
                if (found !== undefined) {
                    if (found.version === packageItem.Details.Version) {
                        logger$$.info(`Version '${found.version}' found.`);
                        if (!splited) {
                            resolve(found.latest);
                        }
                        else {
                            let foundAsset = found.assets.findIndex(x => x.version === packageItem.Details.Version);
                            if (foundAsset !== -1) {
                                resolve(this.tryToResolveSplitedPackage(packageItem, foundAsset, found));
                            }
                            else {
                                resolve(undefined);
                            }
                        }
                    }
                    else {
                        logger$$.info(`Not targeting the latest version '${found.version}', trying to find version '${packageItem.Details.Version}'`);
                        let assetIndex = found.assets.findIndex(x => x.version === packageItem.Details.Version);
                        if (assetIndex !== -1) {
                            let asset = found.assets[assetIndex];
                            logger$$.info(`Version '${packageItem.Details.Version}' found.`);
                            let link = this.buildCdnLink(found.latest, found.version, packageItem.Details.Version);
                            if (link !== undefined) {
                                if (splited) {
                                    resolve(this.tryToResolveSplitedPackage(packageItem, assetIndex, found, link));
                                }
                                else {
                                    let checkFile = path.parse(link).base;
                                    logger$$.info(`Checking file '${checkFile}'`);
                                    let results = this.checkIfFileExist(asset.files, link, checkFile);
                                    if (!results.Found && checkFile.indexOf("-") !== -1) {
                                        logger$$.info(`Checking file '${checkFile}'`);
                                        checkFile = checkFile.split("-").join("");
                                        results = this.checkIfFileExist(asset.files, link, checkFile);
                                    }
                                    if (results.Found) {
                                        logger$$.info(`File successfully found.`);
                                        resolve(results.Link);
                                    }
                                    else {
                                        logger$$.info(`File does not found in '${packageItem.Details.Version}' version.`);
                                        resolve(undefined);
                                    }
                                }
                            }
                            else {
                                logger$$.error([
                                    "Failed to resolve cdn link. Please report this error.",
                                    `--- ERROR DETAILS ---`,
                                    `LatestLink: ${found.latest}`,
                                    `LatestVersion: ${found.version}`,
                                    `TargetVersion:  ${packageItem.Details.Version}`,
                                    `---------------------`
                                ].join("\r\n "));
                                resolve(link);
                            }
                        }
                        else {
                            resolve(undefined);
                        }
                    }
                }
                else {
                    logger$$.info(`Package '${packageItem.Details.Name}' with original name was not found. Searching file in assets.`);
                    let resolved = false;
                    for (let i = 0; i < responseDto.results.length; i++) {
                        let item = responseDto.results[i];
                        let foundAsset = item.assets.findIndex(x => x.version === packageItem.Details.Version);
                        if (foundAsset !== -1) {
                            let resolvedItem = this.tryToResolveSplitedPackage(packageItem, foundAsset, item);
                            if (resolvedItem !== undefined) {
                                resolved = true;
                                resolve(resolvedItem);
                                break;
                            }
                        }
                    }
                    if (!resolved) {
                        resolve(undefined);
                    }
                }
            }));
        });
    }
    buildCdnLinkWithCustomFile(latestLink, targetFile) {
        let currentFileName = path.parse(latestLink).base;
        return latestLink.replace(currentFileName, targetFile);
    }
    buildCdnLink(latestLink, latestVersion, targetVersion) {
        let linkDetails = latestLink.split(latestVersion);
        if (linkDetails.length === 2) {
            let link = linkDetails[0] + targetVersion + linkDetails[1];
            return link;
        }
        else {
            return undefined;
        }
    }
    getPackagesList(registry = "npm") {
        let prefix = `${registry}:`;
        let packagesList = new Array();
        jspm.setPackagePath('.');
        let packagesMap = jspm.Loader().getConfig().map;
        for (let name in packagesMap) {
            let fullName = packagesMap[name];
            if (fullName.indexOf(prefix) === 0) {
                let details = fullName.slice(prefix.length, fullName.length).split("@");
                packagesList.push({
                    MapName: name,
                    FullName: fullName,
                    Details: {
                        Name: details[0],
                        Version: details[1]
                    }
                });
            }
        }
        return packagesList;
    }
}

class JspmCdnPathsTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Jspm.CdnPaths:Production";
        this.Description = "Generate CDN paths into 'src/configs/jspm.config.production.js' (cdnjs.com)";
        this.TaskFunction = (production, done) => {
            new JspmCdnPaths().Start(done);
        };
    }
}

class Tasks extends TasksHandler {
    constructor() {
        super(config => {
            config.Tasks = [DefaultTask, WatchTask, CleanTask, CleanBundleTask, CleanLibsTask, BundleTask, JspmCdnPathsTask];
            config.TasksHandlers = [BuildTasksHandler, CleanTasksHandler];
            return config;
        });
    }
}

Configuration.Init();
new Tasks();