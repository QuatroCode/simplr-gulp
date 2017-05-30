import { TaskBase } from '../../task-base';
import * as rimraf from 'rimraf';
import { Paths } from '../../../paths/paths';

export class CleanTask extends TaskBase {

    Name = "Clean";

    Description = "Cleans build directory (wwwroot by default) without wwwroot/libs folder";

    TaskFunction = (production: boolean, done: () => void) => {
        let ignoreGlob = [
            [Paths.Directories.Build, "libs/**"].join("/"),
            [Paths.Directories.Build, "**/.gitkeep"].join("/")
        ];
        
        rimraf(Paths.Builders.AllFiles.InBuild(), { glob: { ignore: ignoreGlob } }, (error: Error) => {
            done();
        });
    }
}
