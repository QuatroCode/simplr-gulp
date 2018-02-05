import * as rimraf from "rimraf";

import { TaskBase } from "../../task-base";
import { Paths } from "../../../paths/paths";
import { Configuration } from "../../../configuration/configuration";

export class CleanBundleTask extends TaskBase {
    public Name: string = "Clean.Bundle";
    public Description: string = "Remove build file (build.js by default) from build directory (wwwroot by default)";

    public TaskFunction = (production: boolean, done: () => void) => {
        rimraf(Paths.Builders.OneFile.InBuild(Configuration.GulpConfig.BundleConfig.BuildFile), (error: Error) => {
            done();
        });
    };
}
