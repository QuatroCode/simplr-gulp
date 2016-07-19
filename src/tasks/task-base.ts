import { Task } from './tasks-contracts';

/**
 * Abstract task base
 * 
 * @abstract
 * @class TaskBase
 * @implements {Task}
 */
abstract class TaskBase implements Task {
    public abstract Name: string;
    public abstract TaskFunction(production: boolean, done?: Function): void | NodeJS.Process | any;
}

export default TaskBase;
