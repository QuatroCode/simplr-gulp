import { Paths } from "./paths";

export abstract class BuilderBase {
    protected abstract builder(startPath: string, param: string | undefined): string;

    public InSource(param?: string | undefined): string {
        const startPath = Paths.Directories.Source;
        return this.builder(startPath, param);
    }

    public InSourceApp(param?: string): string {
        const startPath = Paths.Directories.SourceApp;
        return this.builder(startPath, param);
    }

    public InBuild(param?: string): string {
        const startPath = Paths.Directories.Build;
        return this.builder(startPath, param);
    }

    public InBuildApp(param?: string): string {
        const startPath = Paths.Directories.BuildApp;
        return this.builder(startPath, param);
    }

    protected joinPaths(...pathsList: string[]): string {
        return pathsList.join("/");
    }
}
