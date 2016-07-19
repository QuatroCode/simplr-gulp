import WatchTaskBase from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchConfigsTask extends WatchTaskBase {

    Name = "Configs";

    Globs = Paths.Builders.OneDirectory.InSource("configs");

    TaskFunction(production: boolean) {
        console.log("Configs watch task");
    }

}
