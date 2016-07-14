import { WatchTask } from '../../../tasks/tasks-contracts';
import Paths from '../../../paths/paths';

export default class WatchAssetsTask implements WatchTask {

    Name = "Assets";

    Globs = Paths.Builders.AllDirectories.InSource("assets");
    
    TaskFunction(production: boolean, done: Function) {

        console.log("Assets watch task");
        done();
    }


}
