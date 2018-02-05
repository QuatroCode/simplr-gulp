import * as rimraf from "rimraf";
import { TaskBase } from "../../task-base";
import { Paths } from "../../../paths/paths";

export class CleanAllTask extends TaskBase {
    public Name: string = "Clean.All";
    public Description: string = "Cleans build directory (wwwroot by default)";

    public TaskFunction = (production: boolean, done: () => void) => {
        const ignoreLibsPath = [Paths.Directories.Build, "**", ".gitkeep"].join("/");
        rimraf(Paths.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreLibsPath } }, (error: Error) => {
            done();
        });
    };
}
