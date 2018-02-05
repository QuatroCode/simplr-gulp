import { TaskBase } from "../task-base";
import { WatcherTasksHandler } from "../../watchers/watcher-tasks-handler";

export class WatchTask extends TaskBase {
    public Name: string = "Watch";
    public Description: string = "Watch source files and start tasks";

    public TaskFunction = (production: boolean, done: () => void) => {
        new WatcherTasksHandler();
        done();
    };
}
