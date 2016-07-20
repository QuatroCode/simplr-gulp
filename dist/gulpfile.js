'use strict';

var fs = require('fs');
var Colors = require('colors/safe');
var gulp = require('gulp');
var path = require('path');
var ts = require('gulp-typescript');

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

var LogType;
(function (LogType) {
    LogType[LogType["Default"] = 0] = "Default";
    LogType[LogType["Error"] = 1] = "Error";
    LogType[LogType["Info"] = 2] = "Info";
    LogType[LogType["Warning"] = 3] = "Warning";
})(LogType || (LogType = {}));
class Console {
    constructor() {
        this.styles = Colors.styles;
    }
    getTimeNowWithStyles() {
        return `[${this.styles.grey.open}${GetTimeNow()}${this.styles.grey.close}]`;
    }
    showMessage(type, ...message) {
        let typeString = ` ${LogType[type].toLocaleUpperCase()}:`;
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
        log(`${this.getTimeNowWithStyles()}${this.styles.bold.open}${color}${typeString}`, ...message, this.styles.reset.open);
    }
    log(...message) {
        this.showMessage(LogType.Default, ...message);
    }
    error(...message) {
        this.showMessage(LogType.Error, ...message);
    }
    info(...message) {
        this.showMessage(LogType.Info, ...message);
    }
    warn(...message) {
        this.showMessage(LogType.Warning, ...message);
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
        Exclude: ['[wwwroot/js/app/**/*]']
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
    }
    Init() { }
    ;
    tryToReadConfigurationFile(cfgFileName = 'gulpconfig') {
        try {
            let config = require(`./${cfgFileName}.json`);
            let valid = true;
            if (parseInt(config.CfgVersion.toString()) !== parseInt(DEFAULT_GULP_CONFIG.CfgVersion.toString())) {
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
}
var Configuration = new ConfigurationLoader();

class TasksHandler {
    constructor(config) {
        this._className = GetClassName(this.constructor);
        this._moduleName = `TasksHandler.${this._className}`;
        this.configuration = config(this.initConfiguration);
        this.constructedTasks = this.registerTasks(this.configuration.Tasks);
        this.loadTasksHandlers(this.configuration.TasksHandlers);
        this.registerMainTask();
    }
    get initConfiguration() {
        return {
            TasksPrefix: "",
            TasksSufix: "",
            Tasks: [],
            TasksHandlers: [],
            TasksAsync: true,
            WithProduction: false
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
                    gulp.task(fullName, constructedTask.TaskFunction.bind(this, false));
                    if (this.configuration.WithProduction) {
                        gulp.task(`${fullName}:Production`, constructedTask.TaskFunction.bind(this, true));
                    }
                }
            });
        }
        else {
            logger.warn(`(${this._moduleName}) The tasks list is empty.`);
        }
        return constructedTasks;
    }
    loadTasksHandlers(tasksHandlers) {
        if (tasksHandlers != null && tasksHandlers.length > 0) {
            tasksHandlers.forEach(handler => {
                new handler();
            });
        }
    }
    registerMainTask() {
        if (this.configuration.TasksPrefix != null && this.configuration.TasksPrefix.length > 0) {
            let method = (this.configuration.TasksAsync) ? gulp.parallel : gulp.series;
            let tasksList = Object.keys(this.constructedTasks);
            gulp.task(this.configuration.TasksPrefix, method(tasksList));
            if (this.configuration.WithProduction) {
                let tasksListProuction = tasksList.map(x => { return `${x}:Production`; });
                gulp.task(this.configuration.TasksPrefix + ':Production', method(tasksListProuction));
            }
        }
    }
    generateName(taskName) {
        let name = taskName;
        if (this.configuration.TasksPrefix != null && this.configuration.TasksPrefix.length > 0) {
            if (name.slice(0, this.configuration.TasksPrefix.length + 1) !== `${this.configuration.TasksPrefix}.`) {
                name = `${this.configuration.TasksPrefix}.${name}`;
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

class WatchTaskBase extends TaskBase {
    addTasksProductionSuffix(text) {
        return text + ":Production";
    }
}

class DirectoriesBuilder {
    constructor() {
        this.gulpConfig = Configuration.GulpConfig;
        this.Source = this.gulpConfig.Directories.Source;
        this.SourceApp = path.join(this.Source, this.gulpConfig.Directories.App);
        this.Build = this.gulpConfig.Directories.Build;
        this.BuildApp = path.join(this.Build, this.gulpConfig.Directories.App);
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
}

class AllFilesBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name !== undefined) {
            return path.join(startPath, '**', '*' + name);
        }
        else {
            return path.join(startPath, '**', '*');
        }
    }
}

class OneFileBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name !== undefined) {
            return path.join(startPath, name);
        }
        else {
            return startPath;
        }
    }
}

class AllDirectoriesBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name !== undefined) {
            return path.join(startPath, "**", name, "**", "*");
        }
        else {
            return path.join(startPath, "**", "*");
        }
    }
}

class OneDirectoryBuilder extends BuilderBase {
    builder(startPath, name) {
        if (name != null) {
            return path.join(startPath, name);
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
        this.Name = "Assets";
        this.Globs = Paths$1.Builders.AllDirectories.InSource("assets");
    }
    TaskFunction(production, done) {
        console.log("Assets watch task");
        done();
    }
}

class WatchConfigsTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Configs";
        this.Globs = Paths$1.Builders.OneDirectory.InSource("configs");
    }
    TaskFunction(production) {
        console.log("Configs watch task");
    }
}

class WatchHtmlTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Html";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".{htm,html}");
    }
    TaskFunction(production, done) {
        console.log("Html watch task");
        done();
    }
}

class WatchScriptsTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Scripts";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".{ts,tsx}");
    }
    TaskFunction(production, done) {
        let taskName = 'Build.Scripts';
        if (production) {
            taskName = this.addTasksProductionSuffix(taskName);
        }
        return gulp.parallel(taskName)(done);
    }
}

class WatchStylesTask extends WatchTaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Styles";
        this.Globs = Paths$1.Builders.AllFiles.InSource(".scss");
    }
    TaskFunction(production) {
        console.log("Styles watch task");
    }
}

class WatcherTasksHandler extends TasksHandler {
    constructor() {
        super((config) => {
            config.TasksPrefix = "Watch";
            config.Tasks = [WatchAssetsTask, WatchConfigsTask, WatchHtmlTask, WatchScriptsTask, WatchStylesTask];
            return config;
        });
        this.watchers = {};
        this.fileChangeHandler = (pathName, stats) => {
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
            this.watchers[task.Name] = gulp.watch(task.Globs, gulp.parallel(this.generateName(task.Name)));
            this.watchers[task.Name].on('unlink', this.fileUnlinkHandler);
            this.watchers[task.Name].on('change', this.fileChangeHandler);
        });
    }
    changeExtensionToBuilded(pathName) {
        let currentExtension = path.extname(pathName);
        if (currentExtension.length > 1) {
            let targetExtension = Configuration.DefaultExtensions[currentExtension.slice(1)];
            if (targetExtension !== undefined) {
                return pathName.slice(0, -targetExtension.length) + targetExtension;
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
            logger.warn(`WarcherTasksHandler.changeRootPathToBuild(): "${pathName}" path root is not under Source directory (${Configuration.GulpConfig.Directories.Source})`);
            return pathName;
        }
    }
}

class DefaultTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "default";
    }
    TaskFunction(production, done) {
        new WatcherTasksHandler();
        done();
    }
}

class BuildAssetsTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Assets";
    }
    TaskFunction(production, done) {
        console.log("Build.Assets");
        done();
    }
}

class BuildConfigTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Configs";
    }
    TaskFunction(production, done) {
        console.log("BUILD CONFIGS:", production);
        console.log("Build.Configs");
        done();
    }
}

class BuildHtmlTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Html";
    }
    TaskFunction(production, done) {
        console.log("Build.Html");
        done();
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

class TypescriptBuilderCompiler {
    constructor(configFile) {
        this.Project = ts.createProject(configFile);
    }
}

class TypescriptBuilder extends BuilderBase$1 {
    build(production, builder, done) {
        let tsResult = gulp.src(Paths$1.Builders.AllFiles.InSource())
            .pipe(ts(builder.Project));
        tsResult.js.pipe(gulp.dest(Paths$1.Directories.Build)).on("end", done);
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

class BuildScriptsTask {
    constructor() {
        this.Name = "Build.Scripts";
    }
    TaskFunction(production, done) {
        TypescriptBuilder$1.Build(production, done);
    }
}

class BuildStylesgTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Build.Styles";
    }
    TaskFunction(production, done) {
        console.log("Build.Styles");
        done();
    }
}

class BuildTasksHandler extends TasksHandler {
    constructor() {
        super(config => {
            config.TasksPrefix = "Build";
            config.Tasks = [BuildAssetsTask, BuildConfigTask, BuildHtmlTask, BuildScriptsTask, BuildStylesgTask];
            config.WithProduction = true;
            return config;
        });
    }
}

class WatchTask extends TaskBase {
    constructor(...args) {
        super(...args);
        this.Name = "Watch";
    }
    TaskFunction(production, done) {
        new WatcherTasksHandler();
        done();
    }
}

class Tasks extends TasksHandler {
    constructor() {
        super(config => {
            config.Tasks = [DefaultTask, WatchTask];
            config.TasksHandlers = [BuildTasksHandler];
            return config;
        });
    }
}

Configuration.Init();
new Tasks();