import { TaskBase } from '../../../../task-base';
import { TslintBuilder } from '../../../../../builders/tslint/tslint-builder';

export class BuildScriptsTsLintTask extends TaskBase {

    Builder = new TslintBuilder();

    Name = "Build.Scripts.Tslint";

    Description = "Compiles Tslint to check all source warnings";

    TaskFunction = this.Builder.Build;
}
