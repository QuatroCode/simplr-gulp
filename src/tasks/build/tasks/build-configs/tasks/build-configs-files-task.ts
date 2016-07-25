import TaskBase from '../../../../task-base';
import * as gulp from 'gulp';
import Paths from '../../../../../paths/paths';

export default class BuildConfigsFilesTask extends TaskBase {

    Name = "Build.Configs.Files";

    Description = "Copies *.config files (web.config for Asp.Net 5 projects) from source to build directory";

    TaskFunction = (production: boolean) => {
        return gulp.src(Paths.Builders.AllFiles.InSource(".config"))
            .pipe(gulp.dest(Paths.Directories.Build));
    }

}
