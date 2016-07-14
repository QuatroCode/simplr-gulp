import TaskBase from '../../../task-base';

export default class BuildHtmlTask extends TaskBase {

    Name = "Build.Html";

    TaskFunction(production: boolean, done: Function) {
        console.log("Build.Html");
        done();
    }


}
