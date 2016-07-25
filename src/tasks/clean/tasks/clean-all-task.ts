import TaskBase from '../../task-base';
import * as rimraf from 'rimraf';

export default class CleanAllTask extends TaskBase {

    Name = "Clean.All";

    Description = "Cleans build directory (wwwroot by default)";

    TaskFunction = (production: boolean, done: () => void) => {
        rimraf("wwwroot/**/*", (error: Error) => {
            done();
        });
    }


}