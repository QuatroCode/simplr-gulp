import TaskBase from '../../../../task-base';
import * as gulp from 'gulp';
import * as path from 'path';
import { Paths } from '../../../../../paths/paths';
import * as cache from 'gulp-cached';

export class BuildConfigsFoldersTask extends TaskBase {

    Name = "Build.Configs.Folders";

    Description = "Copies configs folder from source to build directory";

    TaskFunction = (production: boolean) => {
        return gulp
            .src(Paths.Builders.OneDirectory.InSource(["configs", "**", "*"].join("/")))
            .pipe(cache("configs.folders"))
            .pipe(gulp.dest(path.join(Paths.Directories.Build, "configs")));
    }


}
