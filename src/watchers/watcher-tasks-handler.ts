import * as gulp from 'gulp';
import * as fs from 'fs';
import { Configuration } from '../configuration/configuration';
import { LoggerInstance } from '../utils/logger';
import * as path from 'path';
import { WatchTask } from './watcher-task-base';
import { LiveReloadActionsCreators } from '../actions/live-reload/live-reload-actions-creators';

import { TasksHandler } from '../tasks/tasks-handler';

//Tasks
import { WatchAssetsTask } from './tasks/watch-assets/watch-assets-task';
import { WatchConfigsTask } from './tasks/watch-configs/watch-configs-task';
import { WatchHtmlTask } from './tasks/watch-html/watch-html-task';
import { WatchScriptsTask } from './tasks/watch-scripts/watch-scripts-task';
import { WatchStylesTask } from './tasks/watch-styles/watch-styles-task';


export default class WatcherTasksHandler extends TasksHandler<WatchTask> {

    constructor() {
        super((config) => {
            config.Name = "Watch";
            config.Tasks = [WatchAssetsTask, WatchConfigsTask, WatchHtmlTask, WatchScriptsTask, WatchStylesTask];
            return config;
        });

        this.registerWatchers();
        LoggerInstance.info(`Started watching files in '${Configuration.GulpConfig.Directories.Source}' folder.`);
    }

    private watchers: { [name: string]: fs.FSWatcher } = {};

    private registerWatchers() {
        Object.keys(this.constructedTasks).forEach(name => {
            let task = this.constructedTasks[name];
            let process = gulp.parallel(this.generateName(task.Name));
            this.watchers[task.Name] = gulp.watch(task.Globs, { ignoreInitial: true }, process);
            this.watchers[task.Name].on("unlink", (path: string) => {
                this.fileUnlinkHandler(path);
                if (task.Unlink != null) {
                    task.Unlink(path);
                }
            });
            this.watchers[task.Name].on("change", (pathName: string, stats: fs.Stats) => {
                this.fileChangeHandler(pathName, stats);
                if (task.Change != null) {
                    task.Change(pathName, stats);
                }
            });
            task.On("start", this.onTaskStart.bind(this, task.Name));
            task.On("end", this.onTaskEnd.bind(this, task.Name));
        });
    }

    private runningTasks = new Array<string>();

    private onTaskStart = (taskName: string) => {
        this.runningTasks.push(taskName);
    }

    private onTaskEnd = (taskName: string) => {
        let found = this.runningTasks.indexOf(taskName);
        if (found > -1) {
            this.runningTasks.splice(found, 1);
        }
        if (this.runningTasks.length === 0) {
            this.onAllTaskEnded();
        }
    }

    private onAllTaskEnded() {
        LiveReloadActionsCreators.ReloadFiles(...this.pendingReloadFiles);
        this.pendingReloadFiles = new Array();
    }

    private pendingReloadFiles = new Array<string>();

    private fileChangeHandler = (pathName: string, stats: fs.Stats) => {
        let targetPathName = this.removeRootSourcePath(pathName);
        targetPathName = this.changeExtensionToBuilded(targetPathName);
        this.pendingReloadFiles.push(targetPathName);
        LoggerInstance.log(`'${pathName}' was changed.`);
    }


    private fileUnlinkHandler = (pathName: string) => {
        let targetPathName = this.changeExtensionToBuilded(pathName);
        targetPathName = this.changeRootPathToBuild(targetPathName);
        fs.unlink(targetPathName, (err) => {
            if (err != null) {
                if (err.code === "ENOENT") {
                    LoggerInstance.warn(`'${targetPathName}' has already been deleted.`);
                } else {
                    LoggerInstance.error(`Failed to delete file '${targetPathName}'\n`, err);
                }
            } else {
                LoggerInstance.log(`'${targetPathName}' was deleted successfully.`);
            }
        });
    }

    private removeRootSourcePath(pathName: string) {
        let pathList = pathName.split(path.sep);
        if (pathList[0] === Configuration.GulpConfig.Directories.Source) {
            pathList[0] = "";
            return path.join(...pathList);
        } else {
            return pathName;
        }
    }

    private changeExtensionToBuilded(pathName: string) {
        let currentExtension = path.extname(pathName);
        if (currentExtension.length > 1) {
            let currentExtensionTarget = currentExtension.slice(1);
            let targetExtension = Configuration.DefaultExtensions[currentExtensionTarget];
            if (targetExtension !== undefined) {
                return pathName.slice(0, -currentExtensionTarget.length) + targetExtension;
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
            LoggerInstance
                .withType("WarcherTasksHandler.changeRootPathToBuild()")
                .warn(`"${pathName}" path root is not under Source directory (${Configuration.GulpConfig.Directories.Source}) `);
            return pathName;
        }
    }
}
