import WatchTaskBase from '../../watcher-task-base';
import Paths from '../../../paths/paths';
import * as gulp from 'gulp';

export default class WatchScriptsTask extends WatchTaskBase {

    Name = "Scripts";

    Globs = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

    TaskFunction(production: boolean, done: () => void) {
        let taskName = 'Build.Scripts';
        if (production) {
            taskName = this.addTasksProductionSuffix(taskName);
        }
        return gulp.parallel(taskName)(done);
    }

}