import { WatchTaskBase } from '../../watcher-task-base';
import { Paths } from '../../../paths/paths';

export class WatchConfigsTask extends WatchTaskBase {

    TaskNamePrefix = "Build";

    Name = "Configs";

    Globs = Paths.Builders.OneDirectory.InSource("configs");

}
