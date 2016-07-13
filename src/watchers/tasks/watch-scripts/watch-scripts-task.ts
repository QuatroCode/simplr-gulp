import { WatchTask } from '../../../tasks/tasks-contracts';
import Paths from '../../../paths/paths';

export default class WatchScriptsTask implements WatchTask {

    Name = "Scripts";

    Globs = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

    TaskFunction() {
        console.log("Scripts watch task");
    }

}