import TaskBase from '../../../task-base';

export default class BuildAssetsTask extends TaskBase {

    Name = "Build.Assets";

    TaskFunction(done: Function) {
        console.log("Build.Assets");
        done();
    }


}
