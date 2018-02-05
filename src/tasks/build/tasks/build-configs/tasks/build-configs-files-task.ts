import * as gulp from "gulp";
import * as through from "through2";
import * as cache from "gulp-cached";
import * as stream from "stream";

import { TaskBase } from "../../../../task-base";
import { Paths } from "../../../../../paths/paths";
import { Configuration } from "../../../../../configuration/configuration";
import { Logger } from "../../../../../utils/logger";

export class BuildConfigsFilesTask extends TaskBase {
    public Name: string = "Build.Configs.Files";
    public Description: string = "Copy `jspm.config.js` file from source to build directory with production enviroment (production only)";

    public TaskFunction = (production: boolean, done: () => void) => {
        const tasks = new Array<gulp.TaskFunction>();
        if (production) {
            const jspmConfigFileName = this.readJspmConfigFileName();

            const task: gulp.TaskFunction = this.prepareJspmConfigForProduction.bind(this, jspmConfigFileName);
            task.displayName = this.Name + ".JspmConfigForProduction";
            tasks.push(task);
            return gulp.parallel(tasks)(done);
        } else {
            done();
        }
    };

    private readJspmConfigFileName(): string | undefined {
        if (Configuration.Package != null) {
            const jspmConfig: { [key: string]: any } = Configuration.Package["jspm"];
            if (jspmConfig != null) {
                let file: string = jspmConfig["configFile"];
                if (file != null) {
                    return file;
                } else {
                    const configFiles = jspmConfig["configFiles"];
                    if (configFiles != null) {
                        file = configFiles["jspm"];
                        if (file != null) {
                            return file;
                        }
                    }
                }
            }
        }
    }

    private prepareJspmConfigForProduction(source: string): NodeJS.ReadWriteStream {
        return gulp
            .src(source)
            .pipe(cache("configs.files"))
            .pipe(this.setSystemJSConfigProductionEnviroment(source))
            .pipe(gulp.dest(Paths.Builders.OneDirectory.InBuild("configs")));
    }

    private setSystemJSConfigProductionEnviroment(fullFileName: string): stream.Transform {
        return through.obj((file, encoding, callback) => {
            const content: string = file.contents.toString();
            if (content.length > 0) {
                const regex = /SystemJS\.config\(({[\s\S.]*?})\)/;
                const json = content.match(regex);
                if (json != null) {
                    // tslint:disable-next-line:prefer-const
                    let jsonObj: any | undefined;
                    try {
                        // TODO: eval?
                        // tslint:disable-next-line:no-eval
                        eval("jsonObj = " + json[1]);
                        if (jsonObj != null) {
                            jsonObj["production"] = true;
                            let resultString = JSON.stringify(jsonObj, null, 4);
                            resultString = `SystemJS.config(${resultString})`;
                            const result = content.replace(new RegExp(regex), resultString);
                            file.contents = new Buffer(result, "utf8");
                        } else {
                            Logger.error(`'${fullFileName}': SystemJS.config not found.`);
                        }
                    } catch (error) {
                        Logger.error(`'${fullFileName}' file content is not valid.`);
                        Logger.error(error);
                    }
                } else {
                    Logger.warn(`'${fullFileName}' file content is not valid.`);
                }
            } else {
                Logger.warn(`'${fullFileName}' file content is empty.`);
            }
            callback(null, file);
        });
    }
}
