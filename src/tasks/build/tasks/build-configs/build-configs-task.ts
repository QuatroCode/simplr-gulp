import TaskBase from '../../../task-base';

export default class BuildConfigTask extends TaskBase {

    Name = "Build.Configs";

    TaskFunction(done: Function) {
        console.log("Build.Configs");
        done();
    }


}
