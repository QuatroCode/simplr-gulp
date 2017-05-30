import { TasksHandler } from '../../../tasks-handler';
import { Task } from '../../../task-base';

//Tasks
import BuildTypescript from './tasks/build-scripts-typescript-task';
import BuildTslint from './tasks/build-scripts-tslint-task';

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build.Scripts";
            config.Tasks = [BuildTypescript, BuildTslint];
            config.WithProduction = true;
            config.TasksAsync = true;
            return config;
        });
    }
}
