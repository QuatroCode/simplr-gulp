import { TaskFunction, Globs } from 'gulp/contracts';

export interface WatchTask {
    Name: string;
    TaskFunction: TaskFunction;
    Globs: Globs;
}