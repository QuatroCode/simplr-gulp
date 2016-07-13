import TaskBase from '../task-base';
import Paths from '../../paths/paths';
import Watcher from '../../watchers/watchers';

export default class WatchTask extends TaskBase {

    Name = "Watch";

    TaskFunction(done: Function) {
        console.log("Watch task");
        new Watcher();
        done();
    }


}
