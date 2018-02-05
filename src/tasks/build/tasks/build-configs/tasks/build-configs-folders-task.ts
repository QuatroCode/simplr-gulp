import * as gulp from "gulp";
import * as cache from "gulp-cached";
import * as path from "path";

import { TaskBase } from "../../../../task-base";
import { Paths } from "../../../../../paths/paths";

export class BuildConfigsFoldersTask extends TaskBase {
    public Name: string = "Build.Configs.Folders";
    public Description: string = "Copies configs folder from source to build directory";

    public TaskFunction = (production?: boolean) =>
        gulp
            .src(Paths.Builders.OneDirectory.InSource(["configs", "**", "*"].join("/")))
            .pipe(cache("configs.folders"))
            .pipe(gulp.dest(path.join(Paths.Directories.Build, "configs")));
}
