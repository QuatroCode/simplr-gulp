import TaskBase from '../task-base';
import Paths from '../../paths/paths';
import WatcherTasksHandler from '../../watchers/watcher-tasks-handler';

export default class DefaultTask extends TaskBase {

    Name = "default";

    TaskFunction(done: Function) {
        console.log("Default task");
        new WatcherTasksHandler();
        done();
    }
}
