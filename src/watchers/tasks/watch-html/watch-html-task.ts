import { WatchTaskBase } from "../../watcher-task-base";
import { Paths } from "../../../paths/paths";

export class WatchHtmlTask extends WatchTaskBase {
    public TaskNamePrefix: string = "Build";
    public Name: string = "Html";
    public Globs: string = Paths.Builders.AllFiles.InSource(".{htm,html}");
}
