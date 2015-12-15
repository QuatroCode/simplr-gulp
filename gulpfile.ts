/// <reference path="typings/tsd.d.ts" />
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import * as express from 'express';
import * as connectLiveReload from 'connect-livereload';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as del from 'del';
import * as sass from 'gulp-sass';
import * as tinylr from 'tiny-lr';
import { exec } from 'child_process';
import * as shell from 'gulp-shell';
import * as autoprefixer from 'gulp-autoprefixer';
import * as uglify from 'gulp-uglify';
import * as replaceExt from 'replace-ext';
import * as replace from 'gulp-replace';
import * as jspm from 'jspm';

class Console {
    static log = console.log;

    private static generateMessage(type: string, message: any) {
        if (typeof message === 'string') {
            if (message.substr(0, type.length).toLowerCase() === type.toLowerCase()) {
                return message;
            }
        }
        return `${type}: ${message}`;
    }

    static error(message: any) {
        let type = 'ERROR';
        message = this.generateMessage(type, message);
        console.error(message);
    }

    static info(message: any) {
        let type = 'INFO';
        message = this.generateMessage(type, message);
        console.info(message);
    }

    static warn(message: any) {
        let type = 'WARNING';
        message = this.generateMessage(type, message);
        console.warn(message);
    }
}

module Configuration {

    export enum Status {
        Init,
        Building,
        WatchServer,
        Done
    }

    export interface Directories {
        Source: string;
        Build: string;
        App: string;
    }

    export interface TypescriptConfig {
        Development: string;
        Production: string;
    }

    export interface Bundle {
        AppFile: string;
        BuildFile: string;
        Include: Array<string>;
        Exclude: Array<string>;
    }

    export interface IConfig {
        Directories: Directories;
        TypescriptConfig: TypescriptConfig;
        BundleConfig: Bundle;
        ServerPort: number;
        LiveReloadPort: number;
        ServerIp: string;
        WebConfig: string;
        CfgVersion: number;
        Extensions: { [ext: string]: string };
    }

    export class Config {

        private defaultConfig: IConfig = {
            Directories: {
                Source: "src",
                Build: "wwwroot",
                App: "app"
            },
            TypescriptConfig: {
                Development: "tsconfig.json",
                Production: "tsconfig.production.json"
            },
            BundleConfig: {
                AppFile: "app.js",
                BuildFile: "build.js",
                Include: [],
                Exclude: ['[wwwroot/js/app/**/*]']
            },
            Extensions: {
                "ts": "js",
                "tsx": "js",
                "scss": "css"
            },
            WebConfig: "web.config",
            ServerPort: 4000,
            LiveReloadPort: 4400,
            ServerIp: '127.0.0.1',
            CfgVersion: 1.01
        }

        private config: IConfig;
        private status: Status = Status.Init;

        constructor() {
            this.tryToReadConfigurationFile();
        }

        private tryToReadConfigurationFile(cfgFileName: string = 'gulpconfig') {
            try {
                let config = require(`./${cfgFileName}.json`) as IConfig;

                let valid = true;
                if (parseInt(config.CfgVersion.toString()) != parseInt(this.defaultConfig.CfgVersion.toString())) {
                    Console.warn(`${cfgFileName}.json file major version is not valid (v${config.CfgVersion} != v${this.defaultConfig.CfgVersion})!`);
                    valid = false;
                } else if (config.CfgVersion < this.defaultConfig.CfgVersion) {
                    Console.warn(`${cfgFileName}.json file version is too old (v${config.CfgVersion} < v${this.defaultConfig.CfgVersion})!`);
                    valid = false;
                } else {
                    this.config = config;
                }

                if (!valid) {
                    Console.warn("Creating new file with default configuration...");
                    this.writeToConfigFile(`${cfgFileName}-v${config.CfgVersion}.json`, config);
                    this.config = this.defaultConfig;
                    this.writeToConfigFile(`${cfgFileName}.json`, this.config);
                }
            } catch (e) {
                this.config = this.defaultConfig;
                this.writeToConfigFile(`${cfgFileName}.json`, this.config);
                Console.warn("gulpconfig.json was not found or is not valid. Creating default configuration...");
            }
        }

        private writeToConfigFile(fileName: string, config: IConfig) {
            fs.writeFile(fileName, JSON.stringify(config, null, 4));
        }

        get Directories() {
            return this.config.Directories;
        }

        get TypescriptConfig() {
            return this.config.TypescriptConfig;
        }

        get ServerPort() {
            return this.config.ServerPort;
        }

        get LiveReloadPort() {
            return this.config.LiveReloadPort;
        }

        get ServerIp() {
            return this.config.ServerIp;
        }

        get Status() {
            return this.status;
        }

        set Status(newStatus: Status) {
            this.status = newStatus;
        }

        get WebConfig() {
            return this.config.WebConfig;
        }

        get BundleConfig() {
            return this.config.BundleConfig;
        }

        get CfgVersion() {
            return this.config.CfgVersion;
        }

        get Extensions() {
            return this.config.Extensions;
        }
    }

}
const Config = new Configuration.Config();

class PathBuilder {

    constructor(private config: Configuration.IConfig) { }

    get SourceDirectory() {
        return this.config.Directories.Source;
    }

    get BuildDirectory() {
        return this.config.Directories.Build;
    }

    get SourceAppDirectory() {
        return path.join(this.config.Directories.Source, this.config.Directories.App);
    }

    get BuildAppDirectory() {
        return path.join(this.config.Directories.Build, this.config.Directories.App);
    }

    public AllDirectoriesInSourceApp(dirName: string) {
        return path.join(this.SourceAppDirectory, '**', dirName, '**', '*');
    }

    public AllDirectoriesInSource(dirName: string) {
        return path.join(this.SourceDirectory, '**', dirName, '**', '*');
    }

    public OneDirectoryInSource(dirName: string) {
        return path.join(this.SourceDirectory, dirName, '**', '*');
    }

    public OneDirectoryInSourceApp(dirName: string) {
        return path.join(this.SourceAppDirectory, dirName, '**', '*');
    }

    public AllFilesInSourceApp(type: string) {
        return path.join(this.SourceAppDirectory, '**', '*' + type);
    }

    public AllFilesInSource(type: string) {
        type = (type === '*') ? type : `*${type}`;
        return path.join(this.SourceDirectory, '**', type);
    }

    public AllFilesInBuild(type: string) {
        type = (type === '*') ? type : `*${type}`;
        return path.join(this.BuildDirectory, '**', type);
    }

    public OneFileInBuild(fileName: string) {
        return path.join(this.BuildDirectory, fileName);
    }

    public OneFileInBuildApp(fileName: string) {
        return path.join(this.BuildAppDirectory, fileName);
    }

    public OneFileInSource(fileName: string) {
        return path.join(this.SourceDirectory, fileName);
    }

    public OneFileInSourceApp(fileName: string) {
        return path.join(this.SourceAppDirectory, fileName);
    }

    public RemoveFullPath(directory: string) {
        return directory.split(`${__dirname}\\`)[1];
    }

    public JoinPathsFromArray(pathsArray: Array<string>) {
        let generatedPath = "";
        for (let key in pathsArray) {
            generatedPath = path.join(generatedPath, pathsArray[key]);
        }
        return generatedPath;

    }

    public ReplaceExtensionFromList(pathName: string) {

        let extensions = Config.Extensions;

        let current = path.extname(pathName).substring(1);
        if (extensions[current] != null) {
            let replaceTo = extensions[current];
            return replaceExt(pathName, `.${replaceTo}`);
        } else {
            return pathName;
        }
    }
}
const Paths = new PathBuilder(Config);

class StartServer {
    private server = express();
    private liveReload = tinylr();

    constructor() {
        let livereload = connectLiveReload({ port: Config.LiveReloadPort }) as express.Handler;
        Console.info(`Server started at ${Config.ServerIp}:${Config.ServerPort}`);
        this.server.use(livereload);
        this.server.use(express.static(Config.Directories.Build));
        this.server.listen(Config.ServerPort);
        this.server.all('/*', function (req, res) {
            res.sendFile('index.html', { root: Config.Directories.Build });
        });
        this.liveReload.listen(Config.LiveReloadPort);
    }
}

class ShellCommands {

    static PipeLiveReload() {
        return shell(`curl http://${Config.ServerIp}:${Config.LiveReloadPort}/changed?files=<%= file.path %>`, { quiet: true });
    }

}

class TypescriptProject {

    private project: ts.Project;

    private configFile: string;

    get Project() {
        return this.project;
    }

    constructor(configFile: string) {
        this.configFile = configFile;
        this.project = ts.createProject(configFile);
    }

    private build(sourceMap: boolean) {
        let src = [Paths.AllFilesInSource('.ts*'), `!${Paths.OneDirectoryInSource('libs')}`];
        let task = gulp.src(src);
        if (sourceMap) task = task.pipe(sourcemaps.init());
        task = task.pipe(ts(this.project)).js;
        if (sourceMap)
            task = task.pipe(sourcemaps.write());
        else
            task = task.pipe(uglify({
                mangle: true,
                compress: true,
            }));
        return task.pipe(gulp.dest(this.project.config.compilerOptions.outDir));
    }

    public BuildDevelopment() {
        return this.build(true);
    }

    public BuildProduction() {
        return this.build(false);
    }

}

class SassBuilder {

    private build(development: boolean) {
        return gulp
            .src(Paths.AllFilesInSourceApp('.scss'))
            .pipe(sass({
                outputStyle: (development) ? "nested" : "optimized"
            }))
            .pipe(autoprefixer({
                browsers: ['last 3 versions', '> 1%', 'IE 9', 'IE 10', 'IE 11', 'Firefox ESR']
            }))
            .pipe(gulp.dest(Paths.BuildAppDirectory));
    }

    public BuildDevelopment() {
        return this.build(false);
    }

    public BuildProduction() {
        return this.build(true);
    }

}

class FilesWatcher {

    private watcher(dir: string | Array<string>, gulpTask: Array<string>) {
        return gulp.watch(dir, gulpTask).on('change', this.onFileChanged);
    }

    constructor(private rootDir: string, private appDir: string) {
        this.watcher(Paths.AllFilesInSourceApp('.ts*'), ['_ts']);
        this.watcher(Paths.AllFilesInSource('.html'), ['_html']);
        this.watcher(Paths.AllFilesInSourceApp('.scss'), ['_sass']);
        this.watcher(Paths.AllDirectoriesInSource('assets'), ['_assets']);
        this.watcher([Paths.OneFileInSource(Config.WebConfig), Paths.OneFileInSource('config.js')], ['_configs']);
        Console.info(`Started watching files in '${rootDir}' folder.`);
    }

    private onFileChanged = (event: gulp.WatchEvent) => {
        let file = Paths.RemoveFullPath(event.path);
        Console.info(`${file}: ${event.type}, running tasks...`);
        if (event.type === "deleted") {
            this.deleteFile(file);
        }
    }

    private deleteFile(pathName: string) {
        let pathNames = pathName.split(path.sep);
        if (pathNames[0] === Paths.SourceDirectory) {
            pathNames[0] = Paths.BuildDirectory;
            pathName = Paths.JoinPathsFromArray(pathNames);
            pathName = Paths.ReplaceExtensionFromList(pathName);
            del(pathName).catch((e) => {
                Console.error(`Failed to delete file '${pathName}'`);
            });
        } else {
            Console.error(`Failed to delete file. ('${Paths.SourceDirectory}' not found in path '${pathName}')`);
        }
    }

}

class GulpTasks {

    private registerGulpTask(name: string, callBack: Function) {
        gulp.task(name, callBack);
    }

    private runTasks(tasks: Array<string> | string) {
        let array = typeof tasks !== "string";

        return new Promise((callBack: Function) => {
            let counter = 1;
            return gulp.start(tasks).onAll(() => {
                if (!array || array && counter === tasks.length) {
                    callBack();
                } else {
                    counter++;
                }
            });
        });
    }

    constructor() {
        this.registerGulpTask('default', this.startWatcherAndServer);
        this.registerGulpTask('_html', this.buildHtml);
        this.registerGulpTask('_ts', this.buildTypescript.bind(this, false));
        this.registerGulpTask('_ts:prod', this.buildTypescript.bind(this, true));
        this.registerGulpTask('_sass', this.buildSass.bind(this, false));
        this.registerGulpTask('_sass:prod', this.buildSass.bind(this, true));
        this.registerGulpTask('_assets', this.copyFiles.bind(this, Paths.AllDirectoriesInSource('assets'), Paths.BuildDirectory, null));
        this.registerGulpTask('_configs', this.configs);
        this.registerGulpTask(':bundle', this.bundle.bind(this, false));
        this.registerGulpTask(':bundle:prod', this.bundle.bind(this, true));
        this.registerGulpTask(':build', this.buildCode);
        this.registerGulpTask(':build:prod', this.buildCodeForProduction);
        this.registerGulpTask(':clean', this.clean);
    }

    private configs = () => {

        this.copyFiles(Paths.OneFileInSource(Config.WebConfig), Paths.BuildDirectory);
        this.copyFiles(Paths.OneFileInSource("config.js"), Paths.BuildDirectory, replace('wwwroot/', ''));
    }

    private bundle = (production: boolean) => {
        let jspmInclude = Config.BundleConfig.Include;
        let jspmExclude = Config.BundleConfig.Exclude;
        jspm.setPackagePath('.');
        let appFile = Paths.OneFileInBuildApp(Config.BundleConfig.AppFile);
        let bundleCmd = appFile;
        let buildDest = Paths.OneFileInBuild(Config.BundleConfig.BuildFile);

        for (let i = 0; i < jspmInclude.length; i++) {
            bundleCmd += ` + ${jspmInclude[i]}`;
        }

        for (let i = 0; i < jspmExclude.length; i++) {
            bundleCmd += ` - ${jspmExclude[i]}`;
        }

        Console.info(`jspm bundle ${bundleCmd} ${buildDest}`);
        return jspm.bundle(bundleCmd, buildDest, { mangle: production, minify: production }).then(() => {
            Console.info(`'${appFile}' bundled in '${buildDest}' file.`);
        }).catch((e: any) => {
            Console.error(e.toString());
        });

    }

    private buildCodeForProduction = () => {
        Config.Status = Configuration.Status.Building;
        return this.runTasks(['_html', '_assets', '_sass:prod', '_ts:prod', '_configs']);
    }

    private buildCode = () => {
        Config.Status = Configuration.Status.Building;
        return this.runTasks(['_html', '_assets', '_sass', '_ts', '_configs']);
    }

    private clean = () => {
        return del(
            [`!${Paths.BuildDirectory}`,
                Paths.AllFilesInBuild('*')]
        ).then(() => {
            Console.info(`All files from ${Paths.BuildDirectory} folder was removed.`);
        }).catch((e: any) => {
            Console.error(e);
        });
    }

    private startWatcherAndServer = () => {
        new StartServer();
        new FilesWatcher(Paths.SourceDirectory, Paths.SourceAppDirectory);
        Config.Status = Configuration.Status.WatchServer;
    }

    private buildHtml = () => {
        let task = gulp.src(Paths.AllFilesInSource('.html'))
            .pipe(gulp.dest(Paths.BuildDirectory));

        if (Config.Status === Configuration.Status.WatchServer) task = task.pipe(ShellCommands.PipeLiveReload());

        return task;
    }


    private buildTypescript = (production: boolean) => {
        let configFile = (production) ? Config.TypescriptConfig.Production : Config.TypescriptConfig.Development;
        let tsProject = new TypescriptProject(configFile);
        let task: NodeJS.ReadWriteStream;
        if (production)
            task = tsProject.BuildProduction();
        else
            task = tsProject.BuildDevelopment();

        if (Config.Status === Configuration.Status.WatchServer) task = task.pipe(ShellCommands.PipeLiveReload());

        return task;
    }

    private buildSass = (production: boolean) => {
        let task: NodeJS.ReadWriteStream;
        let builder = new SassBuilder();
        if (production)
            task = builder.BuildProduction();
        else
            task = builder.BuildDevelopment();

        if (Config.Status === Configuration.Status.WatchServer) task = task.pipe(ShellCommands.PipeLiveReload());

        return task;
    }

    private copyFiles = (sourceDir: string | Array<string>, destDir: string, pipe?: any) => {
        let task = gulp.src(sourceDir);
        if (pipe != null) task = task.pipe(pipe);
        task = task.pipe(gulp.dest(destDir));
        if (Config.Status === Configuration.Status.WatchServer) task = task.pipe(ShellCommands.PipeLiveReload());
        return task;
    }

}

new GulpTasks();
