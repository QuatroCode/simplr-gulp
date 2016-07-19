import WatchTaskBase from '../../watcher-task-base';
import Paths from '../../../paths/paths';

export default class WatchStylesTask extends WatchTaskBase {

    Name = "Styles";
    
    Globs = Paths.Builders.AllFiles.InSource(".scss");

    TaskFunction(production: boolean) {
        console.log("Styles watch task");
    }

}
