import TasksHandler from '../tasks-handler';
import { Task } from '../tasks-contracts';

//Tasks
import DefaultTask from './default-task';
import BuildTasksHandler from '../build/build-tasks-handler';
import WatchTask from '../watch/watch-task';

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Tasks = [DefaultTask, WatchTask];
            config.TasksHandlers = [BuildTasksHandler];
            return config;
        });
    }
}
