import TaskBase from '../../../task-base';
import * as gulp from 'gulp';
import Paths from '../../../../paths/paths';

export default class BuildAssetsTask extends TaskBase {

    Name = "Build.Assets";

    TaskFunction  = (production: boolean, done: () => void) => {
        gulp.src(Paths.Builders.AllDirectories.InSource("assets"))
            .pipe(gulp.dest(Paths.Directories.Build))
            .on("end", done);
    }

}
