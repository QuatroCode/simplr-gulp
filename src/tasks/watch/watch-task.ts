import TaskBase from '../task-base';
import Paths from '../../paths/paths';
import WatcherTasksHandler from '../../watchers/watcher-tasks-handler';

export default class WatchTask extends TaskBase {

    Name = "Watch";

    TaskFunction(production: boolean, done: Function) {
        console.log("Watch task");
        new WatcherTasksHandler();
        done();
    }


}
