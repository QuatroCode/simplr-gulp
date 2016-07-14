import {  Globs } from 'gulp/contracts';

export interface Task {
    Name: string;
    TaskFunction: (production: boolean, done?: Function) =>  void | NodeJS.Process | any;
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