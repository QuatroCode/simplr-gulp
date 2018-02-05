import * as gulp from "gulp";
import { TaskConstructor, TasksHandlerContructor } from "./tasks-contracts";
import { Task } from "./task-base";
import { Logger } from "../utils/logger";
import { GetClassName } from "../utils/helpers";

interface Configuration<T> {
    TasksSufix: string;
    TasksAsync: boolean;
    Name: string;
    Tasks: Array<TaskConstructor<T>>;
    TasksHandlers: Array<TasksHandlerContructor<any>>;
    WithProduction: boolean;
    HandlerAsTask: boolean;
}

export abstract class TasksHandler<T extends Task> {
    constructor(config: (context: Configuration<T>) => Configuration<T>) {
        this.configuration = config(this.initConfiguration);
        this.constructedTasks = this.registerTasks(this.configuration.Tasks);
        this.constructedTasksHandler = this.loadTasksHandlers(this.configuration.TasksHandlers);
        if (this.configuration.HandlerAsTask) {
            this.registerMainTask();
        }
    }

    private configuration: Configuration<T>;

    protected constructedTasks: { [name: string]: T };
    protected constructedTasksHandler: { [name: string]: TasksHandler<any> };

    // tslint:disable-next-line:variable-name
    private readonly _className: string = GetClassName(this.constructor);

    // tslint:disable-next-line:variable-name
    private readonly _moduleName: string = `TasksHandler.${this._className}`;

    public get TaskName(): string {
        return this.configuration.Name;
    }

    private get initConfiguration(): Configuration<T> {
        return {
            Name: "",
            TasksSufix: "",
            Tasks: [],
            TasksHandlers: [],
            TasksAsync: true,
            WithProduction: false,
            HandlerAsTask: true
        };
    }

    // tslint:disable-next-line:typedef
    private registerTasks(tasks: Array<TaskConstructor<T>>) {
        const constructedTasks: { [name: string]: T } = {};

        if (tasks == null || tasks.length === 0) {
            Logger.warn(`(${this._moduleName}) The tasks list is empty.`);
            return constructedTasks;
        }

        tasks.forEach(task => {
            const constructedTask = new task();
            const fullName = this.generateName(constructedTask.Name);
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

        return constructedTasks;
    }

    private registerTaskFunction(name: string, production: boolean, constructedTask: T): void {
        const func: gulp.TaskFunction = constructedTask.TaskFunction.bind(this, production);
        func.displayName = name;
        if (constructedTask.Description != null && !production) {
            func.description = "# " + constructedTask.Description;
        }
        gulp.task(name, func);
    }

    // tslint:disable-next-line:typedef
    private loadTasksHandlers(tasksHandlers: Array<TasksHandlerContructor<TasksHandler<any>>>) {
        const constructedTasksHander: { [name: string]: TasksHandler<any> } = {};
        if (tasksHandlers == null || tasksHandlers.length === 0) {
            return constructedTasksHander;
        }

        tasksHandlers.forEach(handler => {
            const taskHandler = new handler();
            const fullName = taskHandler.TaskName;
            if (constructedTasksHander[fullName] != null) {
                Logger.warn(`(${this._moduleName}) Tasks handler "${fullName}" already exist.`);
            } else {
                constructedTasksHander[fullName] = taskHandler;
            }
        });
        return constructedTasksHander;
    }

    private registerMainTask(): void {
        if (this.configuration.Name == null || this.configuration.Name.length === 0) {
            return;
        }

        const method = this.configuration.TasksAsync ? gulp.parallel : gulp.series;
        const tasksList = Object.keys(this.constructedTasks).concat(Object.keys(this.constructedTasksHandler));
        gulp.task(this.configuration.Name, method(tasksList));
        if (this.configuration.WithProduction) {
            const tasksListProduction = tasksList.map(x => `${x}:Production`);
            gulp.task(`${this.configuration.Name}:Production`, method(tasksListProduction));
        }
    }

    protected generateName(taskName: string): string {
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
