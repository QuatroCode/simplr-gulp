import { Duplex } from 'stream';

export interface Task {
    Name: string;
    TaskFunction: TaskFunction;
}


interface TaskFunction {
    (production: boolean, done?: Function): void | Duplex | NodeJS.Process | any;
}

/**
 * Abstract task base
 * 
 * @abstract
 * @class TaskBase
 * @implements {Task}
 */
abstract class TaskBase implements Task {
    public abstract Name: string;
    public abstract TaskFunction: TaskFunction;
}

export default TaskBase;
