import { WatchTaskBase } from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchHtmlTask extends WatchTaskBase {

    TaskNamePrefix = "Build";

    Name = "Html";

    Globs = Paths.Builders.AllFiles.InSource(".{htm,html}");

}
