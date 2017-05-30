import { Configuration } from '../../configuration/configuration';

export default class DirectoriesBuilder {
    private gulpConfig = Configuration.GulpConfig;
    Source = this.gulpConfig.Directories.Source;
    SourceApp = [this.Source, this.gulpConfig.Directories.App].join("/");
    Build = this.gulpConfig.Directories.Build;
    BuildApp = [this.Build, this.gulpConfig.Directories.App].join("/");
}
