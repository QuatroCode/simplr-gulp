import TaskBase from '../../../task-base';

export default class BuildConfigTask extends TaskBase {

    Name = "Build.Configs";

    TaskFunction(production: boolean, done: Function) {
        console.log("BUILD CONFIGS:", production);
        console.log("Build.Configs");
        done();
    }


}
