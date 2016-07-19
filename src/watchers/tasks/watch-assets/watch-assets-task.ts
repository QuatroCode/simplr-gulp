import WatchTaskBase from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchAssetsTask extends WatchTaskBase {

    Name = "Assets";

    Globs = Paths.Builders.AllDirectories.InSource("assets");

    TaskFunction(production: boolean, done: () => void) {
        console.log("Assets watch task");
        done();
    }


}
