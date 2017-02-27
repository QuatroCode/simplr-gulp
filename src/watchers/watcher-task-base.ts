import TaskBase, { Task } from '../tasks/task-base';
import * as gulp from 'gulp';
import * as fs from "fs";
import { LoggerInstance } from "../utils/logger";

export interface WatchTask extends Task {
    Globs: gulp.Globs;
    On: (eventName: WatchEvents, callback: Function) => void;
    Unlink?: (fileName: string) => void;
    Change?: (fileName: string, stats: fs.Stats) => void;
}

type WatchEvents = "end" | "start";

interface Listener {
    Callback: Function;
    Event: WatchEvents;
}

export interface OnCallback {
    remove: () => void;
}

/**
 * Abstract watch task base
 * 
 * @abstract
 * @class WatchTaskBase
 * @extends {TaskBase}
 */
abstract class WatchTaskBase extends TaskBase implements WatchTask {

    abstract Globs: string | Array<string>;

    abstract TaskNamePrefix: string;

    protected WatchTaskFunction: (production: boolean, done?: () => void) => void | Promise<any>;

    protected UseWatchTaskFunctionOnly = false;

    Description = "Watch source files and start tasks";

    TaskFunction = (production: boolean, done: () => void) => {
        let taskName = `${this.TaskNamePrefix}.${this.Name}`;
        if (production) {
            taskName = this.addTasksProductionSuffix(taskName);
        }

        let completeTask = () => {
            this.emit("end");
            done();
        };

        if (this.UseWatchTaskFunctionOnly) {
            if (this.WatchTaskFunction == null) {
                LoggerInstance.withType(`in class ${this._className}`)
                    .error(`Cannot use "UseWatchTaskFunctionOnly" without "WatchTaskFunction" function.`);
                completeTask();
                return;
            }

            let maybePromise = this.WatchTaskFunction(production, done);

            if (maybePromise != null && maybePromise.then != null) {
                maybePromise
                    .then(completeTask)
                    .catch((error) => {
                        LoggerInstance.withType(taskName).error(error);
                        completeTask();
                    });
            }
        } else {
            return gulp.parallel(this.getStarterFunction(taskName), taskName)(completeTask);
        }
    }

    private getStarterFunction(taskName: string) {
        let func: gulp.TaskFunction = (done: () => void) => {
            this.emit("start");
            done();
        };
        func.displayName = taskName + ".Starter";
        return func;
    }

    protected addTasksProductionSuffix(text: string) {
        return text + ":Production";
    }



    private listeners: { [uniqId: string]: Listener } = {};
    private uniqId = 0;

    private get UniqueId(): number {
        return this.uniqId++;
    }

    public On(eventName: WatchEvents, callback: Function): OnCallback {
        let id = this.UniqueId;
        this.listeners[id] = { Callback: callback, Event: eventName };
        return { remove: this.removeListener.bind(this, id) };
    }


    private emit(eventName: WatchEvents, ...params: Array<any>): void {
        Object.keys(this.listeners).forEach(key => {
            let listener = this.listeners[key];
            if (listener.Event === eventName) {
                listener.Callback(params);
            }
        });
    }

    private removeListener(id: number): void {
        if (this.listeners[id] != null) {
            delete this.listeners[id];
        }
    }
}

export default WatchTaskBase;
