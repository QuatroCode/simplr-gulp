import * as ts from 'gulp-typescript';
import Paths from '../../paths/paths';
import * as path from 'path';
import Logger from '../../utils/logger';
import { FixSeparator } from '../../utils/helpers';

interface TsConfig extends ts.TsConfig {
    include?: Array<string>;
}

interface Config {
    Include: Array<string>;
    OutDir: string;
    Exclude?: Array<string>;
    RootDir?: string;
    Src: Array<string> | string;
}

export default class TypescriptBuilderCompiler {

    constructor(configFile: string) {
        this.Project = this.createTsProject(configFile);
        let tsConfig = this.Project.config as TsConfig;
        this.setConfig(tsConfig);
    }

    public Project: ts.Project;

    public Config: Config;

    private setConfig(tsConfig: TsConfig) {
        this.Config = {} as Config;
        this.Config.RootDir = this.generateRootDir(tsConfig.compilerOptions['rootDir']);
        this.Config.OutDir = this.generateOutDir(tsConfig.compilerOptions['outDir']);
        this.Config.Include = this.generateInclude(tsConfig.include, this.Config.RootDir);
        this.Config.Exclude = this.generateExclude(tsConfig.exclude);
        this.Config.Src = this.generateSrc(this.Config.Include, this.Config.Exclude);
    }


    private createTsProject(configFile: string): ts.Project {
        let requiredTypescript = require("typescript");
        Logger.withType("TS").info(`Using Typescript@${requiredTypescript.version}`);
        return ts.createProject(configFile, {
            typescript: requiredTypescript
        });
    }

    private generateSrc(include: Array<string>, exclude: Array<string> | undefined): Array<string> {
        let results = include;
        if (exclude != null) {
            results = results.concat(exclude);

        }
        return results.map(src => {
            return FixSeparator(src);
        });
    }

    private generateInclude(include: Array<string> | undefined, rootDir: string): Array<string> {
        let results: Array<string>;
        if (include != null) {
            let resultInclude = include.map(inc => {
                if (inc !== undefined) {
                    if (path.extname(inc).length === 0) {
                        return this.addAvailableTsExtensions(inc);
                    } else {
                        return inc;
                    }
                }
            }).filter(x => x != null) as Array<string>;
            resultInclude = resultInclude.map(src => {
                return FixSeparator(src);
            });
            if (resultInclude.indexOf(rootDir) === -1) {
                resultInclude.push(rootDir);
            }
            results = resultInclude;
        } else {
            results = [FixSeparator(rootDir)];
        }
        return results;
    }

    private generateExclude(exclude: Array<string> | undefined): Array<string> | undefined {
        if (exclude != null) {
            let tempExclude = exclude.map(exc => {
                if (exc !== undefined) {
                    return `!${exc}`;
                }
            });
            if (tempExclude.length > 0) {
                let resultInclude = tempExclude.filter(x => x != null) as Array<string>;
                if (tempExclude.length > 0) {
                    return resultInclude;
                }
            }
        }
        return undefined;
    }

    private generateRootDir(rootDir: string | undefined): string {
        if (rootDir != null) {
            return [rootDir, "**", `*${this.addAvailableTsExtensions()}`].join("/");
        } else {
            return Paths.Builders.AllFiles.InSource(this.addAvailableTsExtensions());
        }
    }

    private generateOutDir(outDir: string | undefined): string {
        return outDir || Paths.Directories.Build;
    }

    private addAvailableTsExtensions(name: string = ""): string {
        return name + ".{ts,tsx}";
    }

}
