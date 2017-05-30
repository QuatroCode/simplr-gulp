import { TaskBase } from '../../../../task-base';
import TsLintBuilder from '../../../../../builders/tslint/tslint-builder';

export class BuildScriptsTsLintTask extends TaskBase {

    Name = "Build.Scripts.Tslint";

    Description = "Compiles Tslint to check all source warnings";

    TaskFunction = TsLintBuilder.Build;
}
