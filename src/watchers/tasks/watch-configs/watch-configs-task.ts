import { WatchTask } from '../../../tasks/tasks-contracts';
import Paths from '../../../paths/paths';

export default class WatchConfigsTask implements WatchTask {

    Name = "Configs";

    Globs = Paths.Builders.OneDirectory.InSource("configs");

    TaskFunction() {
        console.log("Configs watch task");
    }

}
