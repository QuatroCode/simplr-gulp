import TaskBase from '../task-base';
import WatcherTasksHandler from '../../watchers/watcher-tasks-handler';
import Server from '../../server';

export default class DefaultTask extends TaskBase {

    Name = "default";

    TaskFunction = (production: boolean, done: () => void) => {
        new WatcherTasksHandler();
        new Server();
        done();
    }
}
