import TaskBase from '../../../../task-base';
import * as gulp from 'gulp';
import { Paths } from '../../../../../paths/paths';
import * as through from 'through2';
import { Configuration } from '../../../../../configuration/configuration';
import { LoggerInstance } from '../../../../../utils/logger';
import * as cache from 'gulp-cached';

export class BuildConfigsFilesTask extends TaskBase {

    Name = "Build.Configs.Files";

    Description = "Copy `jspm.config.js` file from source to build directory with production enviroment (production only)";

    TaskFunction = (production: boolean, done: () => void) => {

        let tasks = new Array<gulp.TaskFunction>();
        if (production) {
            let jspmConfigFileName = this.readJspmConfigFileName();

            let task: gulp.TaskFunction = this.prepareJspmConfigForProduction.bind(this, jspmConfigFileName);
            task.displayName = this.Name + ".JspmConfigForProduction";
            tasks.push(task);
            return gulp.parallel(tasks)(done);
        } else {
            done();
        }
    }

    private readJspmConfigFileName() {
        if (Configuration.Package != null) {
            let jspmConfig: { [key: string]: any } = Configuration.Package['jspm'];
            if (jspmConfig != null) {
                let file: string = jspmConfig['configFile'];
                if (file != null) {
                    return file;
                } else {
                    let configFiles = jspmConfig['configFiles'];
                    if (configFiles != null) {
                        file = configFiles['jspm'];
                        if (file != null) {
                            return file;
                        }
                    }
                }
            }
        }
    }

    private prepareJspmConfigForProduction(source: string) {
        return gulp.src(source)
            .pipe(cache("configs.files"))
            .pipe(this.setSystemJSConfigProductionEnviroment(source))
            .pipe(gulp.dest(Paths.Builders.OneDirectory.InBuild("configs")));
    }


    private setSystemJSConfigProductionEnviroment(fullFileName: string) {
        return through.obj((file, encoding, callback) => {
            let content: string = file.contents.toString();
            if (content.length > 0) {
                var regex = /SystemJS\.config\(({[\s\S.]*?})\)/;
                var json = content.match(regex);
                if (json != null) {
                    let jsonObj: any | undefined;
                    try {
                        eval('jsonObj = ' + json[1]);
                        if (jsonObj != null) {
                            jsonObj['production'] = true;
                            let resultString = JSON.stringify(jsonObj, null, 4);
                            resultString = `SystemJS.config(${resultString})`;
                            let result = content.replace(new RegExp(regex), resultString);
                            file.contents = new Buffer(result, 'utf8');
                        } else {
                            LoggerInstance.error(`'${fullFileName}': SystemJS.config not found.`);
                        }
                    } catch (error) {
                        LoggerInstance.error(`'${fullFileName}' file content is not valid.`);
                        LoggerInstance.error(error);
                    }

                } else {
                    LoggerInstance.warn(`'${fullFileName}' file content is not valid.`);
                }
            } else {
                LoggerInstance.warn(`'${fullFileName}' file content is empty.`);
            }
            callback(null, file);
        });
    }

}
