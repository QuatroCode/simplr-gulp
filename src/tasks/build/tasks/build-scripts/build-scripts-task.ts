import TaskBase from '../../../task-base';
import TypescriptBuilder from '../../../../builders/typescript/typescript-builder';

export default class BuildScriptsTask extends TaskBase {

    Name = "Build.Scripts";

    Description = "Compiles TypeScript from source to build directory";

    TaskFunction = (production: boolean, done: () => void) => {
        TypescriptBuilder.Build(production, done);
    }
}
