import { WatchTaskBase } from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export class WatchScriptsTask extends WatchTaskBase {

    TaskNamePrefix = "Build";
    Name = "Scripts";

    Globs = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

}
