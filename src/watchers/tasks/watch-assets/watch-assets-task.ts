import { WatchTaskBase } from "../../watcher-task-base";
import { Paths } from "../../../paths/paths";

export class WatchAssetsTask extends WatchTaskBase {
    public TaskNamePrefix: string = "Build";
    public Name: string = "Assets";
    public Globs: string = Paths.Builders.AllDirectories.InSource("assets");
}
