import TaskBase from '../task-base';
import Paths from '../../paths/paths';
import Watcher from '../../watcher/watchers';

export default class DefaultTask extends TaskBase {

    Name = "default";

    TaskFunction(done: Function) {
        console.log("Default task");
        new Watcher();
        done();
    }
}
