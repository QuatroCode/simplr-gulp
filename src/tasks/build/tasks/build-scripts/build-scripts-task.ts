import TaskBase from '../../../task-base';

export default class BuildScriptsTask extends TaskBase {

    Name = "Build.Scripts";

    TaskFunction(done: Function) {
        console.log("Build.Scripts");
        done();
    }


}
