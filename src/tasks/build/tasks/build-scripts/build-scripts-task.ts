import TypescriptBuilder from '../../../../builders/typescript/typescript-builder';

export default class BuildScriptsTask {

    Name = "Build.Scripts";

    TaskFunction = (production: boolean, done: () => void) => {
        TypescriptBuilder.Build(production, done);
    }
}
