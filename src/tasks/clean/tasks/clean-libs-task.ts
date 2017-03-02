import TaskBase from '../../task-base';
import * as rimraf from 'rimraf';
import Paths from '../../../paths/paths';
import * as path from 'path';

export class CleanLibsTask extends TaskBase {

    Name = "Clean.Libs";

    Description = "Cleans libs directory (wwwroot/libs by default)";

    TaskFunction = (production: boolean, done: () => void) => {
        let ignoreLibsPath = [Paths.Directories.Build, "**", ".gitkeep"].join("/");
        rimraf(path.join(Paths.Directories.Build, "libs", "**", "*"), { glob: { ignore: ignoreLibsPath } }, (error: Error) => {
            done();
        });
    }


}