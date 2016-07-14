import TaskBase from '../../../task-base';

export default class BuildScriptsTask extends TaskBase {

    Name = "Build.Scripts";

    TaskFunction(production: boolean, done: Function) {
        console.log("Build.Scripts");
        done();
    }


}
