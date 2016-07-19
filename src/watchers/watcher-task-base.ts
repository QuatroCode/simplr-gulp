import TaskBase, { Task } from '../tasks/task-base';
import { Globs } from 'gulp';

export interface WatchTask extends Task {
    Globs: Globs;
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

    protected addTasksProductionSuffix(text: string) {
        return text + ":Production";
    }
}

export default WatchTaskBase;
