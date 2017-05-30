import { ReloadFiles, ReloadPage } from './live-reload-actions';
import ActionsEmitter from '../../utils/actions-emitter';

class LiveReloadActionsCreatorsClass {

    private reloadFiles: Array<string> | undefined = [];
    private timer: number | undefined;

    private tryToClearTimer() {
        let result = false;
        if (this.timer !== undefined) {
            result = true;
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        return result;
    }

    private setTimer(func: Function) {
        this.timer = setTimeout(func, 300);
    }

    ReloadPage() {
        this.tryToClearTimer();
        this.setTimer(this.emitOnDebounced);

    }

    ReloadFiles(...filesNames: Array<string>) {
        this.tryToClearTimer();
        if (this.reloadFiles !== undefined) {
            this.reloadFiles = this.reloadFiles.concat(filesNames);
        }
        this.setTimer(this.emitOnDebounced);
    }

    private emitOnDebounced = () => {
        if (this.reloadFiles !== undefined) {
            ActionsEmitter.Emit(new ReloadFiles(this.reloadFiles));
        } else {
            ActionsEmitter.Emit(new ReloadPage());
        }
        this.reloadFiles = [];
        this.tryToClearTimer();
    }

}

export const LiveReloadActionsCreators = new LiveReloadActionsCreatorsClass();
