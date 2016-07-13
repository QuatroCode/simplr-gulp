import { WatchTask } from '../../../tasks/tasks-contracts';
import Paths from '../../../paths/paths';

export default class WatchStylesTask implements WatchTask {

    Name = "Styles";
    
    Globs = Paths.Builders.AllFiles.InSource(".scss");

    TaskFunction() {
        console.log("Styles watch task");
    }

}
