import TaskBase from '../../../task-base';

export default class BuildStylesgTask extends TaskBase {

    Name = "Build.Styles";

    TaskFunction(production: boolean, done: Function) {
        console.log("Build.Styles");
        done();
    }


}
