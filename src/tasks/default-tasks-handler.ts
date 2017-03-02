import TasksHandler from './tasks-handler';
import { Task } from './task-base';

//Tasks
import DefaultTask from './default/default-task';
import BuildTasksHandler from './build/build-tasks-handler';
import WatchTask from './watch/watch-task';
import CleanTasksHandler from './clean/clean-tasks-handler';
import CleanTask from './clean/tasks/clean-task';
import { CleanBundleTask } from './clean/tasks/clean-bundle-task';
import { CleanLibsTask } from './clean/tasks/clean-libs-task';
import { BundleTask } from './bundle/bundle-task';
import { JspmCdnPathsTask } from './jspm/jspm-cdn-paths-task';
import { SimplrGulpVersionTask } from "./version/simplr-gulp-version-task";

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Tasks = [
                DefaultTask,
                WatchTask,
                CleanTask,
                CleanBundleTask,
                CleanLibsTask,
                BundleTask,
                JspmCdnPathsTask,
                SimplrGulpVersionTask
            ];
            config.TasksHandlers = [BuildTasksHandler, CleanTasksHandler];
            return config;
        });
    }
}
