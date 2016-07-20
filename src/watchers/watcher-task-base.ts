import TaskBase, { Task } from '../tasks/task-base';
import * as gulp from 'gulp';

export interface WatchTask extends Task {
    Globs: gulp.Globs;
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

    TaskFunction = (production: boolean, done: () => void) => {
        let taskName = `${this.TaskNamePrefix}.${this.Name}`;
        if (production) {
            taskName = this.addTasksProductionSuffix(taskName);
        }
        return gulp.parallel(taskName)(done);
    }

    protected addTasksProductionSuffix(text: string) {
        return text + ":Production";
    }
}

export default WatchTaskBase;
