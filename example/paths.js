var path = require('path');
var configuration_1 = require('./configuration');
var PathBuilder = (function () {
    function PathBuilder() {
    }
    Object.defineProperty(PathBuilder.prototype, "SourceDirectory", {
        get: function () {
            return configuration_1.default.GulpConfig.Directories.Source;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathBuilder.prototype, "BuildDirectory", {
        get: function () {
            return configuration_1.default.GulpConfig.Directories.Build;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathBuilder.prototype, "SourceAppDirectory", {
        get: function () {
            return path.join(configuration_1.default.GulpConfig.Directories.Source, configuration_1.default.GulpConfig.Directories.App);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathBuilder.prototype, "BuildAppDirectory", {
        get: function () {
            return path.join(configuration_1.default.GulpConfig.Directories.Build, configuration_1.default.GulpConfig.Directories.App);
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
    return PathBuilder;
}());
