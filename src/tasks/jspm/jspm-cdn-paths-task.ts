import TaskBase from '../task-base';
import JspmCdnPathsBuilder from '../../builders/jspm/jspm-cdn-paths-builder';

export default class JspmCdnPathsTask extends TaskBase {

    Name = "Jspm.CdnPaths:Production";

    Description = "Generate CDN paths into 'src/configs/jspm.config.production.js' (cdnjs.com)";

    TaskFunction = (production: boolean, done: () => void) => {
        new JspmCdnPathsBuilder().Start(done);
    }

}
