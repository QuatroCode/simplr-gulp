import * as tsconfig from 'tsconfig-glob';
import * as ts from 'gulp-typescript';


export default class TypescriptCompiler {

    // private project: ts.Project;
    private tsConfiguration: ts.TsConfig | null = null;

    constructor(configFile: string) {
        this.buildConfiguration(configFile);
    }


    private buildConfiguration(fileName: string) {
        let config = tsconfig({ configPath: ".", configFileName: fileName, async: false }, (err: any = null) => {
            if (err != null) {
                console.log(err);
            }
        }) as any as ts.TsConfig;
        console.log(config);
        this.tsConfiguration = config;
    }


}
