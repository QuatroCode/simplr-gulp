import * as path from 'path';
import Configuration from './configuration';


abstract class BuilderBase {
    protected abstract builder(startPath: string, param: string): string;

    InSource(param: string = undefined) {
        let startPath = Paths.Directories.Source;
        return this.builder(startPath, param);
    }

    InSourceApp(param: string = undefined) {
        let startPath = Paths.Directories.SourceApp;
        return this.builder(startPath, param);
    }

    InBuild(param: string = undefined) {
        let startPath = Paths.Directories.Build;
        return this.builder(startPath, param);
    }

    InBuildApp(param: string = undefined) {
        let startPath = Paths.Directories.BuildApp;
        return this.builder(startPath, param);
    }
}


class DirectoriesBuilder {
    private gulpConfig = Configuration.GulpConfig;
    Source = this.gulpConfig.Directories.Source;
    SourceApp = path.join(this.Source, this.gulpConfig.Directories.App);
    Build = this.gulpConfig.Directories.Build;
    BuildApp = path.join(this.Build, this.gulpConfig.Directories.App);
}

class AllFilesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        if (name != undefined) {
            return path.join(startPath, '**', '*' + name);
        } else {
            return path.join(startPath, '**', '*');
        }
    }
}

class OneFileBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        return path.join(startPath, name);
    }
}


class AllDirectoriesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        return path.join(startPath, "**", name, "**", "*");
    }
}

class OneDirectoryBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        return path.join(startPath, name, "**", "*");
    }
}


namespace Paths {
    export var Directories = new DirectoriesBuilder();
    export namespace Builders {
        export var AllFiles = new AllFilesBuilder();
        export var OneFile = new OneFileBuilder();
        export var AllDirectories = new AllDirectoriesBuilder();
        export var OneDirectory = new OneDirectoryBuilder();
    }
}


export default Paths;