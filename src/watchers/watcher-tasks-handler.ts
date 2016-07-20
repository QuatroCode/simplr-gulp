import * as gulp from 'gulp';
import * as fs from 'fs';
import Configuration from '../configuration/configuration';
import Logger from '../utils/logger';
import * as path from 'path';
import { WatchTask } from './watcher-task-base';

import TasksHandler from '../tasks/tasks-handler';

//Tasks
import WatchAssetsTask from './tasks/watch-assets/watch-assets-task';
import WatchConfigsTask from './tasks/watch-configs/watch-configs-task';
import WatchHtmlTask from './tasks/watch-html/watch-html-task';
import WatchScriptsTask from './tasks/watch-scripts/watch-scripts-task';
import WatchStylesTask from './tasks/watch-styles/watch-styles-task';


export default class WatcherTasksHandler extends TasksHandler<WatchTask> {

    constructor() {
        super((config) => {
            config.TasksPrefix = "Watch";
            config.Tasks = [WatchAssetsTask, WatchConfigsTask, WatchHtmlTask, WatchScriptsTask, WatchStylesTask];
            return config;
        });

        this.registerWatchers();
        Logger.info(`Started watching files in '${Configuration.GulpConfig.Directories.Source}' folder.`);
    }

    private watchers: { [name: string]: fs.FSWatcher } = {};

    private registerWatchers() {
        Object.keys(this.constructedTasks).forEach(name => {
            let task = this.constructedTasks[name];
            this.watchers[task.Name] = gulp.watch(task.Globs, gulp.parallel(this.generateName(task.Name)));

            this.watchers[task.Name].on('unlink', this.fileUnlinkHandler);
            this.watchers[task.Name].on('change', this.fileChangeHandler);
        });
    }

    private fileChangeHandler = (pathName: string, stats: fs.Stats) => {
        //TODO: Make live reload
        // console.log('File ' + path + ' was changed stats: ', stats);
    }

    private fileUnlinkHandler = (pathName: string) => {
        let targetPathName = this.changeExtensionToBuilded(pathName);
        targetPathName = this.changeRootPathToBuild(targetPathName);
        fs.unlink(targetPathName, (err) => {
            if (err != null) {
                if (err.code === "ENOENT") {
                    Logger.warn(`'${targetPathName}' has already been deleted.`);
                } else {
                    Logger.error(`Failed to delete file '${targetPathName}'\n`, err);
                }
            } else {
                Logger.log(`'${targetPathName}' was deleted successfully.`);
            }
        });
    }

    private changeExtensionToBuilded(pathName: string) {
        let currentExtension = path.extname(pathName);
        if (currentExtension.length > 1) {
            let targetExtension = Configuration.DefaultExtensions[currentExtension.slice(1)];
            if (targetExtension !== undefined) {
                return pathName.slice(0, -targetExtension.length) + targetExtension;
            }
        }
        return pathName;
    }

    private changeRootPathToBuild(pathName: string) {
        let pathList = pathName.split(path.sep);
        if (pathList[0] === Configuration.GulpConfig.Directories.Source) {
            pathList[0] = Configuration.GulpConfig.Directories.Build;
            return path.join(...pathList);
        } else {
            Logger.warn(`WarcherTasksHandler.changeRootPathToBuild(): "${pathName}" path root is not under Source directory (${Configuration.GulpConfig.Directories.Source})`);
            return pathName;
        }
    }

    //TODO: Implement onDone
}
