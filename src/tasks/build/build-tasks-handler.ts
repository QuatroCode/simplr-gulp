import TasksHandler from '../tasks-handler';
import { Task } from '../task-base';

//Tasks
import BuildAssetsTask from './tasks/build-assets/buid-assets-task';
import BuildConfigsTaskHandler from './tasks/build-configs/build-configs-tasks-handler';
import BuildHtmlTask from './tasks/build-html/build-html-task';
import BuildScriptsTask from './tasks/build-scripts/build-scripts-task';
import BuildStylesTask from './tasks/build-styles/build-styles-task';

export default class BuildTasksHandler extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build";
            config.Tasks = [BuildAssetsTask, BuildHtmlTask, BuildScriptsTask, BuildStylesTask];
            config.TasksHandlers = [BuildConfigsTaskHandler];
            config.WithProduction = true;
            return config;
        });

    }
}
