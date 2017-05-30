import { TasksHandler } from '../../../tasks-handler';
import { Task } from '../../../task-base';

//Tasks
import { BuildScriptsTypeScriptTask } from './tasks/build-scripts-typescript-task';
import { BuildScriptsTsLintTask } from './tasks/build-scripts-tslint-task';

export class BuildScriptsTaskHandler extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build.Scripts";
            config.Tasks = [BuildScriptsTypeScriptTask, BuildScriptsTsLintTask];
            config.WithProduction = true;
            config.TasksAsync = true;
            return config;
        });
    }
}
