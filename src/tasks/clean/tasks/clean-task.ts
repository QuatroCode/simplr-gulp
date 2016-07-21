import TaskBase from '../../task-base';
import * as rimraf from 'rimraf';
import Paths from '../../../paths/paths';

export default class CleanAllTask extends TaskBase {

    Name = "Clean";

    TaskFunction = (production: boolean, done: () => void) => {
        let ignoreLibsPath = [Paths.Directories.Build, "libs", "**"].join("/");
        rimraf(Paths.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreLibsPath } }, (error: Error) => {
            done();
        });
    }
}