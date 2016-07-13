import TaskBase from '../../../task-base';

export default class BuildStylesgTask extends TaskBase {

    Name = "Build.Styles";

    TaskFunction(done: Function) {
        console.log("Build.Styles");
        done();
    }


}
