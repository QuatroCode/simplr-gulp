import * as path from 'path';
import Configuration from './configuration';


class PathBuilder {

    get SourceDirectory() {
        return Configuration.GulpConfig.Directories.Source;
    }

    get BuildDirectory() {
        return Configuration.GulpConfig.Directories.Build;
    }

    get SourceAppDirectory() {
        return path.join(Configuration.GulpConfig.Directories.Source, Configuration.GulpConfig.Directories.App);
    }

    get BuildAppDirectory() {
        return path.join(Configuration.GulpConfig.Directories.Build, Configuration.GulpConfig.Directories.App);
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


}