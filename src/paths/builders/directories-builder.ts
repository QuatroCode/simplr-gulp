import * as path from 'path';
import Configuration from '../../configuration/configuration';

export default class DirectoriesBuilder {
    private gulpConfig = Configuration.GulpConfig;
    Source = this.gulpConfig.Directories.Source;
    SourceApp = path.join(this.Source, this.gulpConfig.Directories.App);
    Build = this.gulpConfig.Directories.Build;
    BuildApp = path.join(this.Build, this.gulpConfig.Directories.App);
}
