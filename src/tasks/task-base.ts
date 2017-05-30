import { Duplex } from "stream";
import { GetClassName } from "../utils/helpers";

export interface Task {
    Name: string;
    TaskFunction: TaskFunction;
    Description: string;
}


interface TaskFunction {
    (production?: boolean, done?: Function): void | Promise<any> | Duplex | NodeJS.Process;
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
    public abstract Description: string;
    protected readonly _className = GetClassName(this.constructor);
}

export default TaskBase;
