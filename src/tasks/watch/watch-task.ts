import TaskBase from '../task-base';
import WatcherTasksHandler from '../../watchers/watcher-tasks-handler';

export default class WatchTask extends TaskBase {

    Name = "Watch";

    TaskFunction = (production: boolean, done: () => void) => {
        new WatcherTasksHandler();
        done();
    }


}
