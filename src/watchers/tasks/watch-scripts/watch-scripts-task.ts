import { WatchTaskBase } from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchScriptsTask extends WatchTaskBase {

    TaskNamePrefix = "Build";
    Name = "Scripts";

    Globs = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

}
