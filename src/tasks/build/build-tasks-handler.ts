import TasksHandler from '../tasks-handler';
import { Task } from '../tasks-contracts';

//Tasks
import BuildAssetsTask from './tasks/build-assets/buid-assets-task';
import BuildConfigsTask from './tasks/build-configs/build-configs-task';
import BuildHtmlTask from './tasks/build-html/build-html-task';
import BuildScriptsTask from './tasks/build-scripts/build-scripts-task';
import BuildStylesTask from './tasks/build-styles/build-styles-task';

export default class BuildTasksHandler extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.TasksPrefix = "Build";
            config.Tasks = [BuildAssetsTask, BuildConfigsTask, BuildHtmlTask, BuildScriptsTask, BuildStylesTask];
            config.WithProduction = true;
            return config;
        });

    }
}
