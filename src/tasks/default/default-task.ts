import * as gulp from "gulp";

import { TaskBase } from "../task-base";
import { WatcherTasksHandler } from "../../watchers/watcher-tasks-handler";
import { ServerStarter } from "../../server";

export class DefaultTask extends TaskBase {
    public Name: string = "default";
    public Description: string = "Build and start Watch with Server tasks.";

    public TaskFunction = (production: boolean, done: () => void) => {
        if (this.startWithoutBuild) {
            this.startWatcherWithServer(done);
        } else {
            gulp.parallel("Build")(() => {
                this.startWatcherWithServer(done);
            });
        }
    };

    private startWatcherWithServer(done: () => void): void {
        new WatcherTasksHandler();
        new ServerStarter();
        done();
    }

    private get startWithoutBuild(): boolean {
        return process.argv.findIndex(x => x === "--noBuild") !== -1;
    }
}
