import { TasksHandler } from '../tasks-handler';
import { Task } from '../task-base';

//Tasks
import { BuildAssetsTask } from './tasks/build-assets/buid-assets-task';
import { BuildConfigsTaskHandler } from './tasks/build-configs/build-configs-tasks-handler';
import { BuildHtmlTask } from './tasks/build-html/build-html-task';
import { BuildScriptsTaskHandler } from './tasks/build-scripts/build-scripts-handler';
import { BuildStylesTask } from './tasks/build-styles/build-styles-task';

export class BuildTasksHandler extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build";
            config.Tasks = [BuildAssetsTask, BuildHtmlTask, BuildStylesTask];
            config.TasksHandlers = [BuildConfigsTaskHandler, BuildScriptsTaskHandler];
            config.WithProduction = true;
            return config;
        });
    }
}
