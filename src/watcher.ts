import * as gulp from 'gulp';
import { TaskFunction } from 'gulp/contracts';
import Console from './logger';
import Configuration from './configuration';
import Paths from './paths';
import * as fs from 'fs';

interface Watchers {
    Html: fs.FSWatcher;
    Typescript: fs.FSWatcher;
    StyleSheets: fs.FSWatcher;
    Assets: fs.FSWatcher;
    Configurations: fs.FSWatcher;
}

export default class Watcher {

    private watchers = {} as Watchers;


    constructor() {
        let { Directories } = Configuration.GulpConfig;

        this.createWatchersTasks();
        this.createWatchers();

        Console.info(`Started watching files in '${Directories.Source}' folder.`);
    }


    private createWatchersTasks() {
        gulp.task("_Watcher.Html", this.onHtmlChanged);
        gulp.task("_Watcher.Typescript", this.onTypescriptChanged);
        gulp.task("_Watcher.StyleSheets", this.onStyleSheetsChanged);
        gulp.task("_Watcher.Assets", this.onAssetsChanged);
        gulp.task("_Watcher.Configurations", this.onConfigurationsChanged);
    }


    private createWatchers() {
        this.watchers.Html = gulp.watch(Paths.Builders.AllFiles.InSource(".html"), gulp.parallel("_Watcher.Html"));
        this.watchers.Typescript = gulp.watch(Paths.Builders.AllFiles.InSource(".{ts,tsx}"), gulp.parallel("_Watcher.Typescript"));
        this.watchers.StyleSheets = gulp.watch(Paths.Builders.AllFiles.InSource(".scss"), gulp.parallel("_Watcher.StyleSheets"));
        this.watchers.Assets = gulp.watch(Paths.Builders.AllDirectories.InSource("assets"), gulp.parallel("_Watcher.Assets"));
        this.watchers.Configurations = gulp.watch(Paths.Builders.OneDirectory.InSource("configs"), gulp.parallel("_Watcher.Configurations"));
    }

    private onConfigurationsChanged: TaskFunction = (done) => {
        Console.log("onConfigurationsChanged");
        done();
    }

    private onAssetsChanged: TaskFunction = (done) => {
        Console.log("onAssetsChanged");
        done();
    }

    private onStyleSheetsChanged: TaskFunction = (done) => {
        Console.log("onStyleSheetsChanged");
        done();
    }

    private onTypescriptChanged: TaskFunction = (done) => {
        Console.log("onTypescriptChanged");
        done();
    }

    private onHtmlChanged: TaskFunction = (done) => {
        Console.log("test");
        done();
    }





    // private watcher(dir: string | Array<string>, gulpTask: Array<string>) {
    //     return gulp.watch(dir, gulpTask).on('change', this.onFileChanged);
    // }

    // public PendingReload = new Array<string>();
    // public PendingTsLint = new Array<string>();

    // constructor(private rootDir: string, private appDir: string) {
    //     this.watcher(Paths.AllFilesInSourceApp('.ts*'), ['_ts']);
    //     this.watcher(Paths.AllFilesInSource('.html'), ['_html']);
    //     this.watcher(Paths.AllFilesInSourceApp('.scss'), ['_sass']);
    //     this.watcher(Paths.AllDirectoriesInSource('assets'), ['_assets']);
    //     this.watcher(this.generateConfigurationFilesList(), ['_configs']);
    // }

    // private generateConfigurationFilesList() {
    //     let files: Array<string> = [];
    //     files.push(Paths.OneFileInSource('config.js'));
    //     if (Config.WebConfig != null && Config.WebConfig.length > 0) {
    //         files.push(Paths.OneFileInSource(Config.WebConfig));
    //     }
    //     return files;
    // }

    // private onFileChanged = (event: gulp.WatchEvent) => {

    //     let file = Paths.RemoveFullPath(event.path),
    //         parsedFile = path.parse(file),
    //         ext = Config.ExtensionsMap[parsedFile.ext] || parsedFile.ext;


    //     if (event.type === "deleted") {
    //         this.deleteFile(file);
    //     } else {
    //         if (parsedFile.ext === ".ts") {
    //             this.PendingTsLint.push(event.path);
    //         }
    //     }

    //     let pathStart = (parsedFile.dir != Config.Directories.Source) ? parsedFile.dir.split(`${Config.Directories.Source}\\`)[1] : Config.Directories.Source;
    //     let reloadPath = path.normalize(path.join(pathStart, `${parsedFile.name}${ext}`)).replace(/\\/g, '/');
    //     this.PendingReload.push(reloadPath);
    // }


    // private deleteFile(pathName: string) {
    //     let pathNames = pathName.split(path.sep);
    //     if (pathNames[0] === Paths.SourceDirectory) {
    //         pathNames[0] = Paths.BuildDirectory;
    //         pathName = Paths.JoinPathsFromArray(pathNames);
    //         pathName = Paths.ReplaceExtensionFromList(pathName);
    //         del(pathName).catch((e) => {
    //             Console.error(`Failed to delete file '${pathName}'`);
    //         });
    //     } else {
    //         Console.error(`Failed to delete file. ('${Paths.SourceDirectory}' not found in path '${pathName}')`);
    //     }
    // }

}
