import * as gulp from "gulp";
import * as cache from "gulp-cached";
import { TaskBase } from "../../../task-base";
import { Paths } from "../../../../paths/paths";

export class BuildHtmlTask extends TaskBase {
    public Name: string = "Build.Html";
    public Description: string = "Copies all *.html and *.htm files from source to build directory";

    public TaskFunction = (production: boolean, done: () => void) => {
        gulp
            .src(Paths.Builders.AllFiles.InSource(".{htm,html}"))
            .pipe(cache("html"))
            .pipe(gulp.dest(Paths.Directories.Build))
            .on("end", done);
    };
}
