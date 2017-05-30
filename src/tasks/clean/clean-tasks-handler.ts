import { TasksHandler } from '../tasks-handler';
import { Task } from '../task-base';

// Tasks
import { CleanAllTask } from './tasks/clean-all-task';

export class CleanTasksHandler extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Clean";
            config.Tasks = [CleanAllTask];
            config.HandlerAsTask = false;
            return config;
        });
    }
}
