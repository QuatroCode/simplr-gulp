import { WatchTaskBase } from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchStylesTask extends WatchTaskBase {

    Name = "Styles";
    
    TaskNamePrefix = "Build";

    Globs = Paths.Builders.AllFiles.InSource(".scss");

}
