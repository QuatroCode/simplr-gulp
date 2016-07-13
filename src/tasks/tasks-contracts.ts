import { TaskFunction, Globs } from 'gulp/contracts';

export interface Task {
    Name: string;
    TaskFunction: TaskFunction;
}

export interface WatchTask extends Task {
    Globs: Globs;
}

export interface TaskConstructor<T> {
    new (): T;
}


export interface TasksHandlerContructor<T> {
    new (): T;
}