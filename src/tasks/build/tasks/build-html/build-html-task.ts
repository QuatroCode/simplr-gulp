import TaskBase from '../../../task-base';

export default class BuildHtmlTask extends TaskBase {

    Name = "Build.Html";

    TaskFunction(done: Function) {
        console.log("Build.Html");
        done();
    }


}
