import TaskBase from '../../../../task-base';
import * as gulp from 'gulp';
import * as path from 'path';
import Paths from '../../../../../paths/paths';

export default class BuildConfigsFoldersTask extends TaskBase {

    Name = "Build.Configs.Folders";

    TaskFunction = (production: boolean) => {
        return gulp.src(Paths.Builders.OneDirectory.InSource(path.join("configs", "**", "*")))
            .pipe(gulp.dest(path.join(Paths.Directories.Build, "configs")));
    }


}
