import * as gulp from 'gulp';
import { TaskConstructor, TasksHandlerContructor } from './tasks-contracts';
import { Task } from './task-base';
import Logger from '../utils/logger';
import { GetClassName } from '../utils/helpers';


interface Configuration<T> {
    TasksSufix: string;
    TasksAsync: boolean;
    Name: string;
    Tasks: Array<TaskConstructor<T>>;
    TasksHandlers: Array<TasksHandlerContructor<any>>;
    WithProduction: boolean;
}


abstract class TasksHandler<T extends Task> {

    constructor(config: (context: Configuration<T>) => Configuration<T>) {
        this.configuration = config(this.initConfiguration);
        this.constructedTasks = this.registerTasks(this.configuration.Tasks);
        this.constructedTasksHander = this.loadTasksHandlers(this.configuration.TasksHandlers);
        this.registerMainTask();
    }

    private configuration: Configuration<T>;

    protected constructedTasks: { [name: string]: T };
    protected constructedTasksHander: { [name: string]: TasksHandler<any> };

    private readonly _className = GetClassName(this.constructor);

    private readonly _moduleName = `TasksHandler.${this._className}`;

    public get TaskName() {
        return this.configuration.Name;
    };

    private get initConfiguration(): Configuration<T> {
        return {
            Name: "",
            TasksSufix: "",
            Tasks: [],
            TasksHandlers: [],
            TasksAsync: true,
            WithProduction: false
        };
    }

    private registerTasks(tasks: Array<TaskConstructor<T>>) {
        let constructedTasks: { [name: string]: T } = {};
        if (tasks != null && tasks.length > 0) {
            tasks.forEach(task => {
                let constructedTask = new task();
                let fullName = this.generateName(constructedTask.Name);
                if (constructedTasks[fullName] != null) {
                    Logger.warn(`(${this._moduleName}) Task "${fullName}" already exist.`);
                } else {
                    constructedTasks[fullName] = constructedTask;
                    this.registerTaskFunction(fullName, false, constructedTask);
                    if (this.configuration.WithProduction) {
                        this.registerTaskFunction(`${fullName}:Production`, true, constructedTask);
                    }
                }
            });
        } else {
            Logger.warn(`(${this._moduleName}) The tasks list is empty.`);
        }
        return constructedTasks;
    }

    private registerTaskFunction(name: string, production: boolean, constructedTask: T) {
        gulp.task(name, (done: () => void) => {
            let taskRunner = constructedTask.TaskFunction(production, done);
            if (taskRunner !== undefined) {
                if (taskRunner instanceof Promise) {
                    taskRunner.then(() => {
                        done();
                    });
                } else {
                    return taskRunner;
                }
            }
        });
    }

    private loadTasksHandlers(tasksHandlers: Array<TasksHandlerContructor<TasksHandler<any>>>) {
        let constructedTasksHander: { [name: string]: TasksHandler<any> } = {};
        if (tasksHandlers != null && tasksHandlers.length > 0) {
            tasksHandlers.forEach(handler => {
                let taskHandler = new handler();
                let fullName = taskHandler.TaskName;
                if (constructedTasksHander[fullName] != null) {
                    Logger.warn(`(${this._moduleName}) Task handler "${fullName}" already exist.`);
                } else {
                    constructedTasksHander[fullName] = taskHandler;
                }
            });
        }
        return constructedTasksHander;
    }

    private registerMainTask() {
        if (this.configuration.Name != null && this.configuration.Name.length > 0) {
            let method = (this.configuration.TasksAsync) ? gulp.parallel : gulp.series;
            let tasksList = Object.keys(this.constructedTasks).concat(Object.keys(this.constructedTasksHander));
            gulp.task(this.configuration.Name, method(tasksList));
            if (this.configuration.WithProduction) {
                let tasksListProuction = tasksList.map(x => { return `${x}:Production`; });
                gulp.task(this.configuration.Name + ':Production', method(tasksListProuction));
            }
        }
    }

    protected generateName(taskName: string) {
        let name = taskName;

        if (this.configuration.Name != null && this.configuration.Name.length > 0) {
            if (name.slice(0, this.configuration.Name.length + 1) !== `${this.configuration.Name}.`) {
                name = `${this.configuration.Name}.${name}`;
            }
        }

        if (this.configuration.TasksSufix != null && this.configuration.TasksSufix.length > 0) {
            name = `${name}.${this.configuration.TasksSufix}`;
        }
        return name;
    }

}

export default TasksHandler;
