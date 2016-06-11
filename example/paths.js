var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var configuration_1 = require('./configuration');
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
        this.gulpConfig = configuration_1.default.GulpConfig;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Paths;
