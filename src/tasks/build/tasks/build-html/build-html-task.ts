import TaskBase from '../../../task-base';
import * as gulp from 'gulp';
import Paths from '../../../../paths/paths';

export default class BuildHtmlTask extends TaskBase {

    Name = "Build.Html";

    TaskFunction = (production: boolean, done: () => void) => {
        gulp.src(Paths.Builders.AllFiles.InSource(".{htm,html}"))
            .pipe(gulp.dest(Paths.Directories.Build))
            .on("end", done);
    }


}
