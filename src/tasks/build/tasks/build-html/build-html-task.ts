import TaskBase from '../../../task-base';

export default class BuildHtmlTask extends TaskBase {

    Name = "Build.Html";

    TaskFunction(production: boolean, done: () => void) {
        console.log("Build.Html");
        done();
    }


}
