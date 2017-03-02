import TasksHandler from '../../../tasks-handler';
import { Task } from '../../../task-base';

//Tasks
import { BuildScriptsTask } from './tasks/build-scripts-typescript-task';

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build.Scripts";
            config.Tasks = [BuildScriptsTask];
            config.WithProduction = true;
            config.TasksAsync = true;
            return config;
        });
    }
}
