import { Duplex } from 'stream';

export interface Task {
    Name: string;
    TaskFunction: (production: boolean, done?: Function) => void | Duplex | NodeJS.Process | any;
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
    public abstract TaskFunction(production: boolean, done?: Function): void | Duplex | NodeJS.Process | any;
}

export default TaskBase;
