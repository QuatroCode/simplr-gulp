import Paths from './paths';

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

export default BuilderBase;
