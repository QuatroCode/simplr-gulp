import WatchTaskBase from "../../watcher-task-base";
import Paths from "../../../paths/paths";
import * as fs from "fs";
import Logger from "../../../utils/logger";

export default class WatchScriptsTask extends WatchTaskBase {

    TaskNamePrefix = "Build";
    Name = "Scripts";

    Globs = Paths.Builders.AllFiles.InSource(".{ts,tsx}");

    protected UseWatchTaskFunctionOnly = true;

    private filesList = Array<{ Name: string, Stats: fs.Stats }>();

    private getFilesListAndClear() {
        let filesList = this.filesList;
        this.filesList = new Array();
        return filesList;
    }

    protected WatchTaskFunction = () => {
        return new Promise((resolve, reject) => {
            let files = this.getFilesListAndClear();
            Logger.withType("Scripts").info("Changed", files.length, `file${files.length > 1 ? "s" : ""}`);

            files.forEach(file => {
                Logger.withType("Scripts").info(`File name '${file.Name}'`);
            });

            setTimeout(() => {
                resolve();
            }, 500);
        });
    }

    Change(fileName: string, stats: fs.Stats) {
        this.filesList.push({
            Name: fileName,
            Stats: stats
        });
    }

}
