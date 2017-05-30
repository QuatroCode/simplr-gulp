import { TaskBase } from '../../task-base';
import * as rimraf from 'rimraf';
import { Paths } from '../../../paths/paths';
import { Configuration } from '../../../configuration/configuration';

export class CleanBundleTask extends TaskBase {

    Name = "Clean.Bundle";

    Description = "Remove build file (build.js by default) from build directory (wwwroot by default)";

    TaskFunction = (production: boolean, done: () => void) => {
        rimraf(Paths.Builders.OneFile.InBuild(Configuration.GulpConfig.BundleConfig.BuildFile), (error: Error) => {
            done();
        });
    }
}
