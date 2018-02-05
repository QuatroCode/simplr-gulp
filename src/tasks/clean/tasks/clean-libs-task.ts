import * as path from "path";
import * as rimraf from "rimraf";

import { TaskBase } from "../../task-base";
import { Paths } from "../../../paths/paths";

export class CleanLibsTask extends TaskBase {
    public Name: string = "Clean.Libs";
    public Description: string = "Cleans libs directory (wwwroot/libs by default)";

    public TaskFunction = (production: boolean, done: () => void) => {
        const ignoreLibsPath = [Paths.Directories.Build, "**", ".gitkeep"].join("/");
        rimraf(path.join(Paths.Directories.Build, "libs", "**", "*"), { glob: { ignore: ignoreLibsPath } }, (error: Error) => {
            done();
        });
    };
}
