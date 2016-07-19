import * as ts from 'gulp-typescript';

export default class TypescriptBuilderCompiler {
    public Project: ts.Project;

    constructor(configFile: string) {
        this.Project = ts.createProject(configFile);
    }

}
