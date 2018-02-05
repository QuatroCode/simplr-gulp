import { Task, TaskBase } from "../tasks/task-base";
import * as gulp from "gulp";
import * as fs from "fs";
import { Logger } from "../utils/logger";

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
export abstract class WatchTaskBase extends TaskBase implements WatchTask {
    public abstract Globs: string | string[];
    public abstract TaskNamePrefix: string;

    protected WatchTaskFunction: (production: boolean, done?: () => void) => void | Promise<any>;

    protected UseWatchTaskFunctionOnly: boolean = false;

    public Description: string = "Watch source files and start tasks";

    public TaskFunction = (production: boolean, done: () => void) => {
        let taskName = `${this.TaskNamePrefix}.${this.Name}`;
        if (production) {
            taskName = this.addTasksProductionSuffix(taskName);
        }

        const completeTask = () => {
            this.emit("end");
            done();
        };

        if (this.UseWatchTaskFunctionOnly) {
            if (this.WatchTaskFunction == null) {
                Logger.withType(`in class ${this._className}`).error(
                    `Cannot use "UseWatchTaskFunctionOnly" without "WatchTaskFunction" function.`
                );
                completeTask();
                return;
            }

            const maybePromise = this.WatchTaskFunction(production, done);

            if (maybePromise != null && maybePromise.then != null) {
                maybePromise.then(completeTask).catch(error => {
                    Logger.withType(taskName).error(error);
                    completeTask();
                });
            }
        } else {
            return gulp.parallel(this.getStarterFunction(taskName), taskName)(completeTask);
        }
    };

    private getStarterFunction(taskName: string): gulp.TaskFunction {
        const func: gulp.TaskFunction = (done: () => void) => {
            this.emit("start");
            done();
        };
        func.displayName = taskName + ".Starter";
        return func;
    }

    protected addTasksProductionSuffix(text: string): string {
        return text + ":Production";
    }

    private listeners: { [uniqId: string]: Listener } = {};
    private uniqId: number = 0;

    private get UniqueId(): number {
        return this.uniqId++;
    }

    public On(eventName: WatchEvents, callback: Function): OnCallback {
        const id = this.UniqueId;
        this.listeners[id] = { Callback: callback, Event: eventName };
        return { remove: this.removeListener.bind(this, id) };
    }

    private emit(eventName: WatchEvents, ...params: any[]): void {
        Object.keys(this.listeners).forEach(key => {
            const listener = this.listeners[key];
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
