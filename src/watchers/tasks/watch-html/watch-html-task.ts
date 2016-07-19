import WatchTaskBase from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchHtmlTask extends WatchTaskBase {

    Name = "Html";

    Globs = Paths.Builders.AllFiles.InSource(".{htm,html}");

    TaskFunction(production: boolean, done: () => void) {
        console.log("Html watch task");
        done();
    }

}
