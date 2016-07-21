import TaskBase from '../../task-base';
import * as rimraf from 'rimraf';

export default class CleanAllTask extends TaskBase {

    Name = "Clean.All";

    TaskFunction = (production: boolean, done: () => void) => {
        rimraf("wwwroot/**/*", (error: Error) => {
            done();
        });
    }


}