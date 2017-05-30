import { WatchTaskBase } from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchAssetsTask extends WatchTaskBase {

    TaskNamePrefix = "Build";
    
    Name = "Assets";

    Globs = Paths.Builders.AllDirectories.InSource("assets");

}
