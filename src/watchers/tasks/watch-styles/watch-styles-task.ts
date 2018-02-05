import { WatchTaskBase } from "../../watcher-task-base";
import { Paths } from "../../../paths/paths";

export class WatchStylesTask extends WatchTaskBase {
    public Name: string = "Styles";
    public TaskNamePrefix: string = "Build";
    public Globs: string = Paths.Builders.AllFiles.InSource(".scss");
}
