import TaskBase from '../../../task-base';

export default class BuildAssetsTask extends TaskBase {

    Name = "Build.Assets";

    TaskFunction(production: boolean, done: () => void) {
        console.log("Build.Assets");
        done();
    }


}
