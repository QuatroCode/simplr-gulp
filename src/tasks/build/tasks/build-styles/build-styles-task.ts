import TaskBase from '../../../task-base';
import StylesBuilder from '../../../../builders/styles/styles-builder';

export default class BuildStylesgTask extends TaskBase {

    Name = "Build.Styles";

    Description = "Compiles *.scss files from source to build directory";

    TaskFunction = (production: boolean, done: () => void) => {
        StylesBuilder.Build(production, done);
    }


}
