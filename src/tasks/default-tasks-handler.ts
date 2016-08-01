import TasksHandler from './tasks-handler';
import { Task } from './task-base';

//Tasks
import DefaultTask from './default/default-task';
import BuildTasksHandler from './build/build-tasks-handler';
import WatchTask from './watch/watch-task';
import CleanTasksHandler from './clean/clean-tasks-handler';
import CleanTask from './clean/tasks/clean-task';
import CleanBundleTask from './clean/tasks/clean-bundle-task';
import CleanLibsTask from './clean/tasks/clean-libs-task';
import BundleTask from './bundle/bundle-task';

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Tasks = [DefaultTask, WatchTask, CleanTask, CleanBundleTask, CleanLibsTask, BundleTask];
            config.TasksHandlers = [BuildTasksHandler, CleanTasksHandler];
            return config;
        });
    }
}
