import { WatchTaskBase } from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchConfigsTask extends WatchTaskBase {

    TaskNamePrefix = "Build";

    Name = "Configs";

    Globs = Paths.Builders.OneDirectory.InSource("configs");

}
