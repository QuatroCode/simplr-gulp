import { Duplex } from "stream";
import { GetClassName } from "../utils/helpers";

export interface Task {
    Name: string;
    TaskFunction: TaskFunction;
    Description: string;
}

export interface TaskFunction {
    (production?: boolean, done?: Function): void | Promise<any> | Duplex | NodeJS.ReadWriteStream;
}

/**
 * Abstract task base
 *
 * @abstract
 * @class TaskBase
 * @implements {Task}
 */
export abstract class TaskBase implements Task {
    public abstract Name: string;
    public abstract TaskFunction: TaskFunction;
    public abstract Description: string;
    // tslint:disable-next-line:variable-name
    protected readonly _className: string = GetClassName(this.constructor);
}
