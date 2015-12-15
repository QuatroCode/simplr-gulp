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
var Console = (function () {
    function Console() {
    }
    Console.error = function (message) {
        console.error("ERROR: %s", message);
    };
    Console.info = function (message) {
        console.info("INFO: %s", message);
    };
    Console.warn = function (message) {
        console.log("WARNING: %s", message);
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
            this.defaultConfig = {
                Directories: {
                    Source: "src",
                    Build: "wwwroot",
                    App: "app"
                },
                TypescriptConfig: {
                    Development: "tsconfig.json",
                    Production: "tsconfig.production.json"
                },
                WebConfig: "web.config",
                ServerPort: 4000,
                LiveReloadPort: 4400,
                ServerIp: '127.0.0.1'
            };
            this.status = Status.Init;
            this.tryToReadConfigurationFile();
        }
        Config.prototype.tryToReadConfigurationFile = function () {
            try {
                var config = require('./gulpconfig.json');
                this.config = config;
            }
            catch (e) {
                this.config = this.defaultConfig;
                fs.writeFile('gulpconfig.json', JSON.stringify(this.config, null, 4));
                Console.warn("gulpconfig.json was not found or is not valid. Creating default configuration...");
            }
        };
        Object.defineProperty(Config.prototype, "Directories", {
            get: function () {
                return this.config.Directories;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "TypescriptConfig", {
            get: function () {
                return this.config.TypescriptConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "ServerPort", {
            get: function () {
                return this.config.ServerPort;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "LiveReloadPort", {
            get: function () {
                return this.config.LiveReloadPort;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "ServerIp", {
            get: function () {
                return this.config.ServerIp;
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
    PathBuilder.prototype.FilesInSourceApp = function (type) {
        return path.join(this.SourceAppDirectory, '**', '*' + type);
    };
    PathBuilder.prototype.DirectoriesInSourceApp = function (dirName) {
        return path.join(this.SourceAppDirectory, '**', dirName, '**', '*');
    };
    PathBuilder.prototype.DirectoriesInSource = function (dirName) {
        return path.join(this.SourceDirectory, '**', dirName, '**', '*');
    };
    PathBuilder.prototype.FilesInSource = function (type) {
        type = (type === '*') ? type : "*" + type;
        return path.join(this.SourceDirectory, '**', type);
    };
    PathBuilder.prototype.FilesInBuild = function (type) {
        type = (type === '*') ? type : "*" + type;
        return path.join(this.BuildDirectory, '**', type);
    };
    PathBuilder.prototype.FileInSource = function (fileName) {
        return path.join(this.SourceDirectory, fileName);
    };
    PathBuilder.prototype.FileInSourceApp = function (fileName) {
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
    PathBuilder.prototype.ReplaceExtensionToBuild = function (pathName) {
        var extensions = {
            "ts": "js",
            "tsx": "js",
            "scss": "css",
            "less": "css"
        };
        var current = path.extname(pathName).substring(1);
        if (extensions[current] != null) {
            var replaceTo = extensions[current];
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
        var livereload = connectLiveReload({ port: Config.LiveReloadPort });
        Console.info("Server started at " + Config.ServerIp + ":" + Config.ServerPort);
        this.server.use(livereload);
        this.server.use(express.static(Config.Directories.Build));
        this.server.listen(Config.ServerPort);
        this.liveReload.listen(Config.LiveReloadPort);
    }
    return StartServer;
})();
var ShellCommands = (function () {
    function ShellCommands() {
    }
    ShellCommands.PipeLiveReload = function () {
        return shell("curl http://" + Config.ServerIp + ":" + Config.LiveReloadPort + "/changed?files=<%= file.path %>", { quiet: true });
    };
    return ShellCommands;
})();
var TypescriptProject = (function () {
    function TypescriptProject(configFile) {
        this.configFile = configFile;
        this.project = ts.createProject(configFile);
    }
    Object.defineProperty(TypescriptProject.prototype, "Project", {
        get: function () {
            return this.project;
        },
        enumerable: true,
        configurable: true
    });
    TypescriptProject.prototype.build = function (sourceMap) {
        var task = this.project.src();
        if (sourceMap)
            task = task.pipe(sourcemaps.init());
        task = task.pipe(ts(this.project)).js;
        if (sourceMap)
            task = task.pipe(sourcemaps.write());
        else
            task = task.pipe(uglify({
                mangle: true,
                compress: true,
            }));
        return task
            .pipe(gulp.dest(this.project.config.compilerOptions.outDir));
    };
    TypescriptProject.prototype.BuildDevelopment = function () {
        return this.build(true);
    };
    TypescriptProject.prototype.BuildProduction = function () {
        return this.build(false);
    };
    return TypescriptProject;
})();
var SassBuilder = (function () {
    function SassBuilder() {
    }
    SassBuilder.prototype.build = function (development) {
        return gulp
            .src(Paths.FilesInSourceApp('.scss'))
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
        this.watcher(Paths.FilesInSourceApp('.ts*'), ['ts']);
        this.watcher(Paths.FilesInSource('.html'), ['html']);
        this.watcher(Paths.FilesInSourceApp('.scss'), ['sass']);
        this.watcher(Paths.DirectoriesInSource('assets'), ['assets']);
        this.watcher(Paths.FileInSource(Config.WebConfig), ['webconfig']);
        Console.info("Started watching files in '" + rootDir + "' folder.");
    }
    FilesWatcher.prototype.watcher = function (dir, gulpTask) {
        return gulp.watch(dir, gulpTask).on('change', this.onFileChanged);
    };
    FilesWatcher.prototype.deleteFile = function (pathName) {
        var pathNames = pathName.split(path.sep);
        if (pathNames[0] === Paths.SourceDirectory) {
            pathNames[0] = Paths.BuildDirectory;
            pathName = Paths.JoinPathsFromArray(pathNames);
            pathName = Paths.ReplaceExtensionToBuild(pathName);
            del(pathName).catch(function (e) {
                Console.error("Failed to delete file " + pathName);
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
        this.registerGulpTask('default', this.startWatcherAndServer);
        this.registerGulpTask('build', this.buildCode);
        this.registerGulpTask('html', this.buildHtml);
        this.registerGulpTask('ts', this.buildTypescript.bind(this, false));
        this.registerGulpTask('ts:dev', this.buildTypescript.bind(this, true));
        this.registerGulpTask('sass', this.buildSass.bind(this, false));
        this.registerGulpTask('sass:dev', this.buildSass.bind(this, true));
        this.registerGulpTask('assets', this.copyFiles.bind(this, Paths.DirectoriesInSource('assets'), Paths.BuildDirectory));
        this.registerGulpTask('webconfig', this.copyFiles.bind(this, Paths.FileInSource(Config.WebConfig), Paths.BuildDirectory));
        this.registerGulpTask('clean', this.clean);
        this.registerGulpTask('build:prod', this.buildCodeForProduction);
    }
    GulpTasks.prototype.registerGulpTask = function (name, callBack) {
        gulp.task(name, callBack);
    };
    GulpTasks.prototype.buildCodeForProduction = function () {
        Config.Status = Configuration.Status.Building;
        gulp.start(['html', 'assets', 'sass', 'ts', 'webconfig']);
    };
    GulpTasks.prototype.clean = function () {
        return del([("!" + Config.Directories.Build),
            Paths.FilesInBuild('*')]).then(function () {
            Console.info("All files from wwwroot folder was removed");
        });
    };
    GulpTasks.prototype.buildCode = function () {
        Config.Status = Configuration.Status.Building;
        return gulp.start(['html', 'assets', 'sass:dev', 'ts:dev', 'webconfig']);
    };
    GulpTasks.prototype.startWatcherAndServer = function () {
        new StartServer();
        new FilesWatcher(Paths.SourceDirectory, Paths.SourceAppDirectory);
        Config.Status = Configuration.Status.WatchServer;
    };
    GulpTasks.prototype.buildHtml = function () {
        var task = gulp.src(Paths.FilesInSource('.html'))
            .pipe(gulp.dest(Paths.BuildDirectory));
        if (Config.Status === Configuration.Status.WatchServer)
            task = task.pipe(ShellCommands.PipeLiveReload());
        return task;
    };
    GulpTasks.prototype.buildTypescript = function (production) {
        if (production === void 0) { production = false; }
        var configFile = (production) ? Config.TypescriptConfig.Production : Config.TypescriptConfig.Development;
        var tsProject = new TypescriptProject(configFile);
        var task;
        if (production)
            task = tsProject.BuildDevelopment();
        else
            task = tsProject.BuildProduction();
        if (Config.Status === Configuration.Status.WatchServer)
            task = task.pipe(ShellCommands.PipeLiveReload());
        return task;
    };
    GulpTasks.prototype.buildSass = function (production) {
        if (production === void 0) { production = false; }
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
    GulpTasks.prototype.copyFiles = function (sourceDir, destDir) {
        var task = gulp.src(sourceDir)
            .pipe(gulp.dest(destDir));
        if (Config.Status === Configuration.Status.WatchServer)
            task = task.pipe(ShellCommands.PipeLiveReload());
        return task;
    };
    return GulpTasks;
})();
new GulpTasks();
