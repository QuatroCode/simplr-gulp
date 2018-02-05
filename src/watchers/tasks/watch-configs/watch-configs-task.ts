import { WatchTaskBase } from "../../watcher-task-base";
import { Paths } from "../../../paths/paths";

export class WatchConfigsTask extends WatchTaskBase {
    public TaskNamePrefix: string = "Build";
    public Name: string = "Configs";
    public Globs: string = Paths.Builders.OneDirectory.InSource("configs");
}
