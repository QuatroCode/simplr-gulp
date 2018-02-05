import { TaskBase, TaskFunction } from "../../../task-base";
import { StylesBuilder } from "../../../../builders/styles/styles-builder";

export class BuildStylesTask extends TaskBase {
    public Builder: StylesBuilder = new StylesBuilder();
    public Name: string = "Build.Styles";
    public Description: string = "Compiles *.scss files from source to build directory";
    public TaskFunction: TaskFunction = this.Builder.Build;
}
