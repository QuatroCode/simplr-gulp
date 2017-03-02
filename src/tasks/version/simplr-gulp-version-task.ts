import TaskBase from "../task-base";
import * as path from "path";
import { LoggerInstance } from "../../utils/logger";


export class SimplrGulpVersionTask extends TaskBase {

    Name = "Version";

    Description = "Print current simplr-gulp version.";

    TaskFunction = (production: boolean, done: () => void) => {
        var packageJson = require(path.join(__dirname, "../../../", "package.json"));
        LoggerInstance.info(`Using '${packageJson.name}@${packageJson.version}'`);
        done();
    }
}
