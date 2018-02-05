import * as gulp from "gulp";

import { TaskBase } from "../../../task-base";
import { Paths } from "../../../../paths/paths";

export class BuildAssetsTask extends TaskBase {
    public Name: string = "Build.Assets";

    public Description: string = "Copies all assets folders and their contents from source to build directory";

    public TaskFunction = (production: boolean, done: () => void) => {
        gulp
            .src(Paths.Builders.AllDirectories.InSource("assets"))
            .pipe(gulp.dest(Paths.Directories.Build))
            .on("end", done);
    };
}
