import TaskBase from '../../../task-base';
import * as gulp from 'gulp';
import { Paths } from '../../../../paths/paths';

export class BuildAssetsTask extends TaskBase {

    Name = "Build.Assets";

    Description = "Copies all assets folders and their contents from source to build directory";

    TaskFunction  = (production: boolean, done: () => void) => {
        gulp.src(Paths.Builders.AllDirectories.InSource("assets"))
            .pipe(gulp.dest(Paths.Directories.Build))
            .on("end", done);
    }

}
