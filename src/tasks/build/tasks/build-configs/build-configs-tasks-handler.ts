import { TasksHandler } from '../../../tasks-handler';
import { Task } from '../../../task-base';

//Tasks
import { BuildConfigsFilesTask } from './tasks/build-configs-files-task';
import { BuildConfigsFoldersTask } from './tasks/build-configs-folders-task';

export class BuildConfigsTaskHandler extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build.Configs";
            config.Tasks = [BuildConfigsFoldersTask, BuildConfigsFilesTask];
            config.WithProduction = true;
            config.TasksAsync = false;
            return config;
        });
    }
}
