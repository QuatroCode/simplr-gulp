import { Configuration } from "../../configuration/configuration";
import { GulpConfig } from "../../configuration/configuration-contracts";

export class DirectoriesBuilder {
    private gulpConfig: GulpConfig = Configuration.GulpConfig;

    public Source: string = this.gulpConfig.Directories.Source;
    public SourceApp: string = [this.Source, this.gulpConfig.Directories.App].join("/");
    public Build: string = this.gulpConfig.Directories.Build;
    public BuildApp: string = [this.Build, this.gulpConfig.Directories.App].join("/");
}
