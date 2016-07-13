import TasksHandler from '../tasks-handler';
import { Task } from '../tasks-contracts';

//Tasks
import DefaultTask from './default-task';
import BuildTasks from '../build/build-tasks';
import WatchTask from '../watch/watch-task';

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Tasks = [DefaultTask, WatchTask];
            config.TasksHandlers = [BuildTasks];
            return config;
        });
    }
}
