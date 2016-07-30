import TaskBase from '../../../../task-base';
import * as gulp from 'gulp';
import Paths from '../../../../../paths/paths';
import * as through from 'through2';
import Configuration from '../../../../../configuration/configuration';
import Logger from '../../../../../utils/logger';

export default class BuildConfigsFilesTask extends TaskBase {

    Name = "Build.Configs.Files";

    Description = "Copies *.config files (web.config for Asp.Net 5 projects) from source to build directory";

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
                    let jsonObj: { [key: string]: any } | undefined = undefined;
                    try {
                        eval('jsonObj = ' + json[1]);
                        if (jsonObj != null) {
                            jsonObj['production'] = true;
                            let resultString = JSON.stringify(jsonObj, null, 4);
                            resultString = `SystemJS.config(${resultString})`;
                            let result = content.replace(new RegExp(regex), resultString);
                            file.contents = new Buffer(result, 'utf8');
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
