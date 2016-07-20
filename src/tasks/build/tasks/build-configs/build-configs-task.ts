import TaskBase from '../../../task-base';
import * as gulp from 'gulp';
import * as path from 'path';
import Paths from '../../../../paths/paths';

export default class BuildConfigTask extends TaskBase {

    Name = "Build.Configs";

    TaskFunction = (production: boolean, done: () => void) => {
        gulp.src(Paths.Builders.OneDirectory.InSource(path.join("configs", "**", "*")))
            .pipe(gulp.dest(path.join(Paths.Directories.Build, "configs")))
            .on("end", done);
        //TODO: Copy web.config (.NET project)
    }

}
