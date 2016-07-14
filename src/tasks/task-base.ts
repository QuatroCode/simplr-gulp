import { Task } from './tasks-contracts';

abstract class TaskBase implements Task {
    abstract Name: string;
    public abstract TaskFunction(production: boolean, done?: Function): void | NodeJS.Process | any;
}

export default TaskBase;
