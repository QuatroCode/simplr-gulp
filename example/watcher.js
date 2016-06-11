var gulp = require('gulp');
var logger_1 = require('./logger');
var configuration_1 = require('./configuration');
var paths_1 = require('./paths');
var Watcher = (function () {
    function Watcher() {
        this.watchers = {};
        this.onConfigurationsChanged = function (done) {
            logger_1.default.log("onConfigurationsChanged");
            done();
        };
        this.onAssetsChanged = function (done) {
            logger_1.default.log("onAssetsChanged");
            done();
        };
        this.onStyleSheetsChanged = function (done) {
            logger_1.default.log("onStyleSheetsChanged");
            done();
        };
        this.onTypescriptChanged = function (done) {
            logger_1.default.log("onTypescriptChanged");
            done();
        };
        this.onHtmlChanged = function (done) {
            logger_1.default.log("test");
            done();
        };
        var Directories = configuration_1.default.GulpConfig.Directories;
        this.createWatchersTasks();
        this.createWatchers();
        logger_1.default.info("Started watching files in '" + Directories.Source + "' folder.");
    }
    Watcher.prototype.createWatchersTasks = function () {
        gulp.task("_Watcher.Html", this.onHtmlChanged);
        gulp.task("_Watcher.Typescript", this.onTypescriptChanged);
        gulp.task("_Watcher.StyleSheets", this.onStyleSheetsChanged);
        gulp.task("_Watcher.Assets", this.onAssetsChanged);
        gulp.task("_Watcher.Configurations", this.onConfigurationsChanged);
    };
    Watcher.prototype.createWatchers = function () {
        this.watchers.Html = gulp.watch(paths_1.default.Builders.AllFiles.InSource(".html"), gulp.parallel("_Watcher.Html"));
        this.watchers.Typescript = gulp.watch(paths_1.default.Builders.AllFiles.InSource(".{ts,tsx}"), gulp.parallel("_Watcher.Typescript"));
        this.watchers.StyleSheets = gulp.watch(paths_1.default.Builders.AllFiles.InSource(".scss"), gulp.parallel("_Watcher.StyleSheets"));
        this.watchers.Assets = gulp.watch(paths_1.default.Builders.AllDirectories.InSource("assets"), gulp.parallel("_Watcher.Assets"));
        this.watchers.Configurations = gulp.watch(paths_1.default.Builders.OneDirectory.InSource("configs"), gulp.parallel("_Watcher.Configurations"));
    };
    return Watcher;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Watcher;
