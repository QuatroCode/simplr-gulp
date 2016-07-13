import { Task } from './tasks-contracts';
import { TaskFunction } from 'gulp/contracts';
import Paths from '../paths/paths';

abstract class TaskBase implements Task {
    Name: string;
    public abstract TaskFunction(done?: Function): void | NodeJS.Process | any;
}

export default TaskBase;
