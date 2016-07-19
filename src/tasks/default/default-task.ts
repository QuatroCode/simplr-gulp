import TaskBase from '../task-base';
import WatcherTasksHandler from '../../watchers/watcher-tasks-handler';

export default class DefaultTask extends TaskBase {

    Name = "default";

    TaskFunction(production: boolean, done: () => void) {
        new WatcherTasksHandler();
        done();
    }
}
