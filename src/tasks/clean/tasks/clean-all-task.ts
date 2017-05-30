import TaskBase from '../../task-base';
import * as rimraf from 'rimraf';
import { Paths } from '../../../paths/paths';

export class CleanAllTask extends TaskBase {

    Name = "Clean.All";

    Description = "Cleans build directory (wwwroot by default)";

    TaskFunction = (production: boolean, done: () => void) => {
        let ignoreLibsPath = [Paths.Directories.Build, "**", ".gitkeep"].join("/");
        rimraf(Paths.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreLibsPath } }, (error: Error) => {
            done();
        });
    }
}
