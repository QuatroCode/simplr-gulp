import TaskBase from '../../../../task-base';
import TypescriptBuilder from '../../../../../builders/typescript/typescript-builder';

export default class BuildScriptsTask extends TaskBase {

    Name = "Build.Scripts.Typescript";

    Description = "Compiles TypeScript from source to build directory";

    // TaskFunction = (production: boolean, done: () => void) => {
    //     return TypescriptBuilder.Build(production, done, this.Name);
    // }

    TaskFunction = TypescriptBuilder.Build;
}
