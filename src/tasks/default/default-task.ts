import TaskBase from '../task-base';
import WatcherTasksHandler from '../../watchers/watcher-tasks-handler';
import Server from '../../server';
import * as gulp from 'gulp';

export default class DefaultTask extends TaskBase {

    Name = "default";

    Description = "Build and start Watch with Server tasks.";

    TaskFunction = (production: boolean, done: () => void) => {
        if (this.startWithoutBuild) {
            this.startWatcherWithServer(done);
        } else {
            gulp.parallel("Build")(() => {
                this.startWatcherWithServer(done);
            });
        }
    }

    private startWatcherWithServer(done: () => void) {
        new WatcherTasksHandler();
        new Server();
        done();
    }

    private get startWithoutBuild() {
        return (process.argv.findIndex(x => x === "--noBuild") !== -1);
    }
}
