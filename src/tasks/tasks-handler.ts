import * as gulp from 'gulp';
import { Task, TaskConstructor, TasksHandlerContructor } from './tasks-contracts';
import Logger from '../utils/logger';
import { GetClassName } from '../utils/helpers';


interface Configuration<T> {
    TasksSufix: string;
    TasksAsync: boolean;
    TasksPrefix: string;
    Tasks: Array<TaskConstructor<T>>;
    TasksHandlers: Array<TasksHandlerContructor<any>>;
    WithProduction: boolean;
}


abstract class TasksHandler<T extends Task> {

    constructor(config: (context: Configuration<T>) => Configuration<T>) {
        this.configuration = config(this.initConfiguration);
        this.constructedTasks = this.registerTasks(this.configuration.Tasks);
        this.loadTasksHandlers(this.configuration.TasksHandlers);
        this.registerMainTask();
    }

    private configuration: Configuration<T>;

    protected constructedTasks: { [name: string]: T };

    private readonly _className = GetClassName(this.constructor);

    private readonly _moduleName = `TasksHandler.${this._className}`;

    private get initConfiguration(): Configuration<T> {
        return {
            TasksPrefix: "",
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
                    gulp.task(fullName, constructedTask.TaskFunction.bind(this, false));
                    if (this.configuration.WithProduction) {
                        gulp.task(`${fullName}:Production`, constructedTask.TaskFunction.bind(this, true));
                    }
                }
            });
        } else {
            Logger.warn(`(${this._moduleName}) The tasks list is empty.`);
        }
        return constructedTasks;
    }

    private loadTasksHandlers(tasksHandlers: Array<TasksHandlerContructor<TasksHandler<any>>>) {
        if (tasksHandlers != null && tasksHandlers.length > 0) {
            tasksHandlers.forEach(handler => {
                new handler();
            });
        }
    }

    private registerMainTask() {
        if (this.configuration.TasksPrefix != null && this.configuration.TasksPrefix.length > 0) {
            let method = (this.configuration.TasksAsync) ? gulp.parallel : gulp.series;
            let tasksList = Object.keys(this.constructedTasks);
            gulp.task(this.configuration.TasksPrefix, method(tasksList));
            if (this.configuration.WithProduction) {
                let tasksListProuction = tasksList.map(x => { return `${x}:Production`; } );
                gulp.task(this.configuration.TasksPrefix + ':Production', method(tasksListProuction));
            }
        }
    }

    protected generateName(taskName: string) {
        let name = taskName;

        if (this.configuration.TasksPrefix != null && this.configuration.TasksPrefix.length > 0) {
            if (name.slice(0, this.configuration.TasksPrefix.length + 1) !== `${this.configuration.TasksPrefix}.`) {
                name = `${this.configuration.TasksPrefix}.${name}`;
            }
        }

        if (this.configuration.TasksSufix != null && this.configuration.TasksSufix.length > 0) {
            name = `${name}.${this.configuration.TasksSufix}`;
        }
        return name;
    }

}

export default TasksHandler;
