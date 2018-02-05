import * as path from "path";
import { TaskBase } from "../task-base";
import { LoggerInstance } from "../../utils/logger";

export class SimplrGulpVersionTask extends TaskBase {
    public Name: string = "Version";
    public Description: string = "Print current simplr-gulp version.";

    public TaskFunction = (production: boolean, done: () => void) => {
        const packageJson = require(path.join(__dirname, "../../../", "package.json"));
        LoggerInstance.info(`Using '${packageJson.name}@${packageJson.version}'`);
        done();
    };
}
