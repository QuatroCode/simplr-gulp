import TaskBase from '../../../task-base';
import { StylesBuilder } from '../../../../builders/styles/styles-builder';

export default class BuildStylesgTask extends TaskBase {

    Builder: StylesBuilder = new StylesBuilder();

    Name = "Build.Styles";

    Description = "Compiles *.scss files from source to build directory";

    TaskFunction = this.Builder.Build;
}
