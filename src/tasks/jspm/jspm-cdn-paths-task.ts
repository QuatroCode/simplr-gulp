import { TaskBase } from "../task-base";
import { JspmCdnPaths } from "../../builders/jspm/jspm-cdn-paths-builder";

export class JspmCdnPathsTask extends TaskBase {
    public Name: string = "Jspm.CdnPaths:Production";
    public Description: string = "Generate CDN paths into 'src/configs/jspm.config.production.js' (cdnjs.com)";

    public TaskFunction = (production: boolean, done: () => void) => {
        new JspmCdnPaths().Start(done);
    };
}
