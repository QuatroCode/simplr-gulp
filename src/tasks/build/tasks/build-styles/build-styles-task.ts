import TaskBase from '../../../task-base';
import { StylesBuilder } from '../../../../builders/styles/styles-builder';

export default class BuildStylesgTask extends TaskBase {
    constructor() {
        super();
        this.Builder = new StylesBuilder();
    }

    Builder: StylesBuilder;

    Name = "Build.Styles";

    Description = "Compiles *.scss files from source to build directory";

    TaskFunction = this.Builder.Build;

}
