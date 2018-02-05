import { ReloadFiles, ReloadPage } from "./live-reload-actions";
import { ActionsEmitter } from "../../utils/actions-emitter";

class LiveReloadActionsCreatorsClass {
    private reloadFiles: string[] | undefined = [];
    private timer: NodeJS.Timer | undefined;

    private tryToClearTimer(): boolean {
        let result = false;
        if (this.timer !== undefined) {
            result = true;
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        return result;
    }

    private setTimer(func: () => void): void {
        this.timer = setTimeout(func, 300);
    }

    public ReloadPage(): void {
        this.tryToClearTimer();
        this.setTimer(this.emitOnDebounced);
    }

    public ReloadFiles(...filesNames: string[]): void {
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
    };
}

export const LiveReloadActionsCreators = new LiveReloadActionsCreatorsClass();
