import TaskBase from '../../../task-base';
import * as gulp from 'gulp';
import { Paths } from '../../../../paths/paths';
import * as cache from 'gulp-cached';

export class BuildHtmlTask extends TaskBase {

    Name = "Build.Html";

    Description = "Copies all *.html and *.htm files from source to build directory";

    TaskFunction = (production: boolean, done: () => void) => {
        gulp.src(Paths.Builders.AllFiles.InSource(".{htm,html}"))
            .pipe(cache("html"))
            .pipe(gulp.dest(Paths.Directories.Build))
            .on("end", done);
    }


}
