var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var express = require('express');
var connectLiveReload = require('connect-livereload');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var sass = require('gulp-sass');
var tinylr = require('tiny-lr');
var shell = require('gulp-shell');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var replaceExt = require('replace-ext');
var replace = require('gulp-replace');
var jspm = require('jspm');
var Console = (function () {
    function Console() {
    }
    Console.generateMessage = function (type, message) {
        if (typeof message === 'string') {
            if (message.substr(0, type.length).toLowerCase() === type.toLowerCase()) {
                return message;
            }
        }
        return type + ": " + message;
    };
    Console.error = function (message) {
        var type = 'ERROR';
        message = this.generateMessage(type, message);
        console.error(message);
    };
    Console.info = function (message) {
        var type = 'INFO';
        message = this.generateMessage(type, message);
        console.info(message);
    };
    Console.warn = function (message) {
        var type = 'WARNING';
        message = this.generateMessage(type, message);
        console.warn(message);
    };
    Console.log = console.log;
    return Console;
})();
var Configuration;
(function (Configuration) {
    (function (Status) {
        Status[Status["Init"] = 0] = "Init";
        Status[Status["Building"] = 1] = "Building";
        Status[Status["WatchServer"] = 2] = "WatchServer";
        Status[Status["Done"] = 3] = "Done";
    })(Configuration.Status || (Configuration.Status = {}));
    var Status = Configuration.Status;
    var Config = (function () {
        function Config() {
            this.defaultTypeScriptConfig = {
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
            this.defaultConfig = {
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
                ExtensionsMap: {
                    "ts": "js",
                    "tsx": "js",
                    "scss": "css"
                },
                WebConfig: "web.config",
                CfgVersion: 2.01
            };
            this.status = Status.Init;
            this.tryToReadConfigurationFile();
            this.checkTypeScriptConfigurationFiles();
        }
        Config.prototype.tryToReadConfigurationFile = function (cfgFileName) {
            if (cfgFileName === void 0) { cfgFileName = 'gulpconfig'; }
            try {
                var config = require("./" + cfgFileName + ".json");
                var valid = true;
                if (parseInt(config.CfgVersion.toString()) != parseInt(this.defaultConfig.CfgVersion.toString())) {
                    Console.warn(cfgFileName + ".json file major version is not valid (v" + config.CfgVersion + " != v" + this.defaultConfig.CfgVersion + ")!");
                    valid = false;
                }
                else if (config.CfgVersion < this.defaultConfig.CfgVersion) {
                    Console.warn(cfgFileName + ".json file version is too old (v" + config.CfgVersion + " < v" + this.defaultConfig.CfgVersion + ")!");
                    valid = false;
                }
                else {
                    this.config = config;
                }
                if (!valid) {
                    Console.warn("Creating new file with default configuration...");
                    this.writeToFile(cfgFileName + "-v" + config.CfgVersion + ".json", config);
                    this.config = this.defaultConfig;
                    this.writeToFile(cfgFileName + ".json", this.config);
                }
            }
            catch (e) {
                this.config = this.defaultConfig;
                this.writeToFile(cfgFileName + ".json", this.config);
                Console.warn("gulpconfig.json was not found or is not valid. Creating default configuration file...");
            }
        };
        Config.prototype.checkTypeScriptConfigurationFiles = function () {
            try {
                if (!fs.statSync("./" + this.config.TypeScriptConfig.Development).isFile())
                    throw new Error();
            }
            catch (e) {
                var tsConfig = {
                    compilerOptions: this.defaultTypeScriptConfig.compilerOptions,
                    exclude: this.defaultTypeScriptConfig.exclude
                };
                tsConfig.exclude.push(this.config.Directories.Build);
                this.writeToFile(this.config.TypeScriptConfig.Development, tsConfig);
                Console.warn("'" + this.config.TypeScriptConfig.Development + "' was not found. Creating default TypeScript configuration file...");
            }
            try {
                if (!fs.statSync("./" + this.config.TypeScriptConfig.Production).isFile())
                    throw new Error();
            }
            catch (e) {
                var tsConfig = this.defaultTypeScriptConfig;
                tsConfig.compilerOptions.inlineSources = false;
                tsConfig.compilerOptions.removeComments = true;
                tsConfig.compilerOptions.sourceMap = false;
                this.writeToFile(this.config.TypeScriptConfig.Production, tsConfig);
                Console.warn("'" + this.config.TypeScriptConfig.Production + "' was not found. Creating default TypeScript configuration file...");
            }
        };
        Config.prototype.writeToFile = function (fileName, content) {
            fs.writeFile(fileName, JSON.stringify(content, null, 4));
        };
        Object.defineProperty(Config.prototype, "Directories", {
            get: function () {
                return this.config.Directories;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "TypeScriptConfig", {
            get: function () {
                return this.config.TypeScriptConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "ServerConfig", {
            get: function () {
                return this.config.ServerConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "Status", {
            get: function () {
                return this.status;
            },
            set: function (newStatus) {
                this.status = newStatus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "WebConfig", {
            get: function () {
                return this.config.WebConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "BundleConfig", {
            get: function () {
                return this.config.BundleConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "CfgVersion", {
            get: function () {
                return this.config.CfgVersion;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "ExtensionsMap", {
            get: function () {
                return this.config.ExtensionsMap;
            },
            enumerable: true,
            configurable: true
        });
        return Config;
    })();
    Configuration.Config = Config;
})(Configuration || (Configuration = {}));
var Config = new Configuration.Config();
var PathBuilder = (function () {
    function PathBuilder(config) {
        this.config = config;
    }
    Object.defineProperty(PathBuilder.prototype, "SourceDirectory", {
        get: function () {
            return this.config.Directories.Source;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathBuilder.prototype, "BuildDirectory", {
        get: function () {
            return this.config.Directories.Build;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathBuilder.prototype, "SourceAppDirectory", {
        get: function () {
            return path.join(this.config.Directories.Source, this.config.Directories.App);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathBuilder.prototype, "BuildAppDirectory", {
        get: function () {
            return path.join(this.config.Directories.Build, this.config.Directories.App);
        },
        enumerable: true,
        configurable: true
    });
    PathBuilder.prototype.AllDirectoriesInSourceApp = function (dirName) {
        return path.join(this.SourceAppDirectory, '**', dirName, '**', '*');
    };
    PathBuilder.prototype.AllDirectoriesInSource = function (dirName) {
        return path.join(this.SourceDirectory, '**', dirName, '**', '*');
    };
    PathBuilder.prototype.OneDirectoryInSource = function (dirName) {
        return path.join(this.SourceDirectory, dirName, '**', '*');
    };
    PathBuilder.prototype.OneDirectoryInSourceApp = function (dirName) {
        return path.join(this.SourceAppDirectory, dirName, '**', '*');
    };
    PathBuilder.prototype.AllFilesInSourceApp = function (type) {
        return path.join(this.SourceAppDirectory, '**', '*' + type);
    };
    PathBuilder.prototype.AllFilesInSource = function (type) {
        type = (type === '*') ? type : "*" + type;
        return path.join(this.SourceDirectory, '**', type);
    };
    PathBuilder.prototype.AllFilesInBuild = function (type) {
        type = (type === '*') ? type : "*" + type;
        return path.join(this.BuildDirectory, '**', type);
    };
    PathBuilder.prototype.OneFileInBuild = function (fileName) {
        return path.join(this.BuildDirectory, fileName);
    };
    PathBuilder.prototype.OneFileInBuildApp = function (fileName) {
        return path.join(this.BuildAppDirectory, fileName);
    };
    PathBuilder.prototype.OneFileInSource = function (fileName) {
        return path.join(this.SourceDirectory, fileName);
    };
    PathBuilder.prototype.OneFileInSourceApp = function (fileName) {
        return path.join(this.SourceAppDirectory, fileName);
    };
    PathBuilder.prototype.RemoveFullPath = function (directory) {
        return directory.split(__dirname + "\\")[1];
    };
    PathBuilder.prototype.JoinPathsFromArray = function (pathsArray) {
        var generatedPath = "";
        for (var key in pathsArray) {
            generatedPath = path.join(generatedPath, pathsArray[key]);
        }
        return generatedPath;
    };
    PathBuilder.prototype.ReplaceExtensionFromList = function (pathName) {
        var extensionsMap = Config.ExtensionsMap;
        var current = path.extname(pathName).substring(1);
        if (extensionsMap[current] != null) {
            var replaceTo = extensionsMap[current];
            return replaceExt(pathName, "." + replaceTo);
        }
        else {
            return pathName;
        }
    };
    return PathBuilder;
})();
var Paths = new PathBuilder(Config);
var StartServer = (function () {
    function StartServer() {
        this.server = express();
        this.liveReload = tinylr();
        var livereload = connectLiveReload({ port: Config.ServerConfig.LiveReloadPort });
        Console.info("Server started at " + Config.ServerConfig.Ip + ":" + Config.ServerConfig.Port);
        this.server.use(livereload);
        this.server.use(express.static(Config.Directories.Build));
        this.server.listen(Config.ServerConfig.Port);
        this.server.all('/*', function (req, res) {
            res.sendFile('index.html', { root: Config.Directories.Build });
        });
        this.liveReload.listen(Config.ServerConfig.LiveReloadPort);
    }
    return StartServer;
})();
var ShellCommands = (function () {
    function ShellCommands() {
    }
    ShellCommands.PipeLiveReload = function () {
        return shell("curl http://" + Config.ServerConfig.Ip + ":" + Config.ServerConfig.LiveReloadPort + "/changed?files=<%= file.path %>", { quiet: true });
    };
    return ShellCommands;
})();
var TypeScriptProject = (function () {
    function TypeScriptProject(configFile) {
        this.configFile = configFile;
        this.project = ts.createProject(configFile);
    }
    Object.defineProperty(TypeScriptProject.prototype, "Project", {
        get: function () {
            return this.project;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptProject.prototype.build = function (sourceMap) {
        var task = gulp.src(Paths.AllFilesInSource('.ts*'));
        if (sourceMap)
            task = task.pipe(sourcemaps.init());
        task = task.pipe(ts(this.project)).js;
        if (sourceMap)
            task = task.pipe(sourcemaps.write());
        else
            task = task.pipe(uglify({
                mangle: true,
                compress: true
            }));
        return task.pipe(gulp.dest(Config.Directories.Build));
    };
    TypeScriptProject.prototype.BuildDevelopment = function () {
        return this.build(true);
    };
    TypeScriptProject.prototype.BuildProduction = function () {
        return this.build(false);
    };
    return TypeScriptProject;
})();
var SassBuilder = (function () {
    function SassBuilder() {
    }
    SassBuilder.prototype.build = function (development) {
        return gulp
            .src(Paths.AllFilesInSourceApp('.scss'))
            .pipe(sass({
            outputStyle: (development) ? "nested" : "optimized"
        }))
            .pipe(autoprefixer({
            browsers: ['last 3 versions', '> 1%', 'IE 9', 'IE 10', 'IE 11', 'Firefox ESR']
        }))
            .pipe(gulp.dest(Paths.BuildAppDirectory));
    };
    SassBuilder.prototype.BuildDevelopment = function () {
        return this.build(false);
    };
    SassBuilder.prototype.BuildProduction = function () {
        return this.build(true);
    };
    return SassBuilder;
})();
var FilesWatcher = (function () {
    function FilesWatcher(rootDir, appDir) {
        var _this = this;
        this.rootDir = rootDir;
        this.appDir = appDir;
        this.onFileChanged = function (event) {
            var file = Paths.RemoveFullPath(event.path);
            Console.info(file + ": " + event.type + ", running tasks...");
            if (event.type === "deleted") {
                _this.deleteFile(file);
            }
        };
        this.watcher(Paths.AllFilesInSourceApp('.ts*'), ['_ts']);
        this.watcher(Paths.AllFilesInSource('.html'), ['_html']);
        this.watcher(Paths.AllFilesInSourceApp('.scss'), ['_sass']);
        this.watcher(Paths.AllDirectoriesInSource('assets'), ['_assets']);
        this.watcher(this.generateConfigurationFilesList(), ['_configs']);
        Console.info("Started watching files in '" + rootDir + "' folder.");
    }
    FilesWatcher.prototype.watcher = function (dir, gulpTask) {
        return gulp.watch(dir, gulpTask).on('change', this.onFileChanged);
    };
    FilesWatcher.prototype.generateConfigurationFilesList = function () {
        var files = [];
        files.push(Paths.OneFileInSource('config.js'));
        if (Config.WebConfig != null && Config.WebConfig.length > 0) {
            files.push(Paths.OneFileInSource(Config.WebConfig));
        }
        return files;
    };
    FilesWatcher.prototype.deleteFile = function (pathName) {
        var pathNames = pathName.split(path.sep);
        if (pathNames[0] === Paths.SourceDirectory) {
            pathNames[0] = Paths.BuildDirectory;
            pathName = Paths.JoinPathsFromArray(pathNames);
            pathName = Paths.ReplaceExtensionFromList(pathName);
            del(pathName).catch(function (e) {
                Console.error("Failed to delete file '" + pathName + "'");
            });
        }
        else {
            Console.error("Failed to delete file. ('" + Paths.SourceDirectory + "' not found in path '" + pathName + "')");
        }
    };
    return FilesWatcher;
})();
var GulpTasks = (function () {
    function GulpTasks() {
        var _this = this;
        this.jspmInstall = function () {
            return jspm.install(true, { lock: true });
        };
        this.configs = function () {
            if (Config.WebConfig != null && Config.WebConfig.length > 0) {
                _this.copyFiles(Paths.OneFileInSource(Config.WebConfig), Paths.BuildDirectory);
            }
            _this.copyFiles(Paths.OneFileInSource("config.js"), Paths.BuildDirectory, replace(Config.Directories.Build + "/", ''));
        };
        this.bundle = function (production) {
            var jspmInclude = Config.BundleConfig.Include;
            var jspmExclude = Config.BundleConfig.Exclude;
            jspm.setPackagePath('.');
            var appFile = Paths.OneFileInBuildApp(Config.BundleConfig.AppFile);
            var bundleCmd = appFile;
            var buildDest = Paths.OneFileInBuild(Config.BundleConfig.BuildFile);
            for (var i = 0; i < jspmInclude.length; i++) {
                bundleCmd += " + " + jspmInclude[i];
            }
            for (var i = 0; i < jspmExclude.length; i++) {
                bundleCmd += " - " + jspmExclude[i];
            }
            Console.info("jspm bundle " + bundleCmd + " " + buildDest);
            return jspm.bundle(bundleCmd, buildDest, { mangle: production, minify: production }).then(function () {
                Console.info("'" + appFile + "' bundled in '" + buildDest + "' file.");
            }).catch(function (e) {
                Console.error(e.toString());
            });
        };
        this.buildCodeForProduction = function () {
            Config.Status = Configuration.Status.Building;
            return _this.runTasks(['_html', '_assets', '_sass:prod', '_ts:prod', '_configs']);
        };
        this.buildCode = function () {
            Config.Status = Configuration.Status.Building;
            return _this.runTasks(['_html', '_assets', '_sass', '_ts', '_configs']);
        };
        this.clean = function () {
            return del([("!" + Paths.BuildDirectory),
                Paths.AllFilesInBuild('*')]).then(function () {
                Console.info("All files from " + Paths.BuildDirectory + " folder was removed.");
            }).catch(function (e) {
                Console.error(e);
            });
        };
        this.startWatcherAndServer = function () {
            new StartServer();
            new FilesWatcher(Paths.SourceDirectory, Paths.SourceAppDirectory);
            Config.Status = Configuration.Status.WatchServer;
        };
        this.buildHtml = function () {
            var task = gulp.src(Paths.AllFilesInSource('.html'))
                .pipe(gulp.dest(Paths.BuildDirectory));
            if (Config.Status === Configuration.Status.WatchServer)
                task = task.pipe(ShellCommands.PipeLiveReload());
            return task;
        };
        this.buildTypeScript = function (production) {
            var configFile = (production) ? Config.TypeScriptConfig.Production : Config.TypeScriptConfig.Development;
            var tsProject = new TypeScriptProject(configFile);
            var task;
            if (production)
                task = tsProject.BuildProduction();
            else
                task = tsProject.BuildDevelopment();
            if (Config.Status === Configuration.Status.WatchServer)
                task = task.pipe(ShellCommands.PipeLiveReload());
            return task;
        };
        this.buildSass = function (production) {
            var task;
            var builder = new SassBuilder();
            if (production)
                task = builder.BuildProduction();
            else
                task = builder.BuildDevelopment();
            if (Config.Status === Configuration.Status.WatchServer)
                task = task.pipe(ShellCommands.PipeLiveReload());
            return task;
        };
        this.copyFiles = function (sourceDir, destDir, pipe) {
            var task = gulp.src(sourceDir);
            if (pipe != null)
                task = task.pipe(pipe);
            task = task.pipe(gulp.dest(destDir));
            if (Config.Status === Configuration.Status.WatchServer)
                task = task.pipe(ShellCommands.PipeLiveReload());
            return task;
        };
        this.registerGulpTask('default', this.startWatcherAndServer);
        this.registerGulpTask('_html', this.buildHtml);
        this.registerGulpTask('_ts', this.buildTypeScript.bind(this, false));
        this.registerGulpTask('_ts:prod', this.buildTypeScript.bind(this, true));
        this.registerGulpTask('_sass', this.buildSass.bind(this, false));
        this.registerGulpTask('_sass:prod', this.buildSass.bind(this, true));
        this.registerGulpTask('_assets', this.copyFiles.bind(this, Paths.AllDirectoriesInSource('assets'), Paths.BuildDirectory, null));
        this.registerGulpTask('_configs', this.configs);
        this.registerGulpTask(':bundle', this.bundle.bind(this, false));
        this.registerGulpTask(':bundle:prod', this.bundle.bind(this, true));
        this.registerGulpTask(':build', this.buildCode);
        this.registerGulpTask(':build:prod', this.buildCodeForProduction);
        this.registerGulpTask(':clean', this.clean);
        this.registerGulpTask(':jspm:install', this.jspmInstall);
    }
    GulpTasks.prototype.registerGulpTask = function (name, callBack) {
        gulp.task(name, callBack);
    };
    GulpTasks.prototype.runTasks = function (tasks) {
        var array = typeof tasks !== "string";
        return new Promise(function (callBack) {
            var counter = 1;
            return gulp.start(tasks).onAll(function () {
                if (!array || array && counter === tasks.length) {
                    callBack();
                }
                else {
                    counter++;
                }
            });
        });
    };
    return GulpTasks;
})();
new GulpTasks();
