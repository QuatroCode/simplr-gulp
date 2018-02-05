import * as rimraf from "rimraf";

import { TaskBase } from "../../task-base";
import { Paths } from "../../../paths/paths";

export class CleanTask extends TaskBase {
    public Name: string = "Clean";
    public Description: string = "Cleans build directory (wwwroot by default) without wwwroot/libs folder";

    public TaskFunction = (production: boolean, done: () => void) => {
        const ignoreGlob = [[Paths.Directories.Build, "libs/**"].join("/"), [Paths.Directories.Build, "**/.gitkeep"].join("/")];

        rimraf(Paths.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreGlob } }, (error: Error) => {
            done();
        });
    };
}
