import { WatchTask } from '../../../tasks/tasks-contracts';
import Paths from '../../../paths/paths';

export default class WatchConfigsTask implements WatchTask {

    Name = "Configs";

    Globs = Paths.Builders.OneDirectory.InSource("configs");

    TaskFunction(production: boolean) {
        console.log("Configs watch task");
    }

}
