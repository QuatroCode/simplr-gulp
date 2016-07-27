import TasksHandler from '../../../tasks-handler';
import { Task } from '../../../task-base';

//Tasks
import BuildConfigsFiles from './tasks/build-configs-files-task';
import BuildConfigsFolders from './tasks/build-configs-folders-task';

export default class Tasks extends TasksHandler<Task> {

    constructor() {
        super(config => {
            config.Name = "Build.Configs";
            config.Tasks = [BuildConfigsFiles, BuildConfigsFolders];
            config.WithProduction = true;
            return config;
        });
    }
}
