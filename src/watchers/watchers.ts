import * as gulp from 'gulp';
import * as fs from 'fs';
import Configuration from '../configuration/configuration-loader';
import Logger from '../utils/logger';

import { WatchTask } from '../tasks/tasks-contracts';

import TasksHandler from '../tasks/tasks-handler';

//Tasks
import WatchAssetsTask from './tasks/watch-assets/watch-assets-task';
import WatchConfigsTask from './tasks/watch-configs/watch-configs-task';
import WatchHtmlTask from './tasks/watch-html/watch-html-task';
import WatchScriptsTask from './tasks/watch-scripts/watch-scripts-task';
import WatchStylesTask from './tasks/watch-scripts/watch-scripts-task';


export default class Watchers extends TasksHandler<WatchTask> {

    constructor() {
        super((config) => {
            config.TasksPrefix = "Watchers";
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
        });
    }


}
