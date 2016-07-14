import { WatchTask } from '../../../tasks/tasks-contracts';
import Paths from '../../../paths/paths';

export default class WatchHtmlTask implements WatchTask {

    Name = "Html";

    Globs = Paths.Builders.AllFiles.InSource(".{htm,html}");

    TaskFunction(production: boolean, done: Function) {
        console.log("Html watch task");
        done();
    }

}
