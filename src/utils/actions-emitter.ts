
interface Listener {
    Callback: Function;
    Action: any | Object;
}

export class ActionsEmitter {

    private listeners = new Array<Listener>();
    private uniqId = 0;

    private get UniqueId() {
        return this.uniqId++;
    }

    public On(action: any, callback: Function) {
        let id = this.UniqueId;
        this.listeners[id] = { Action: action, Callback: callback };
        return { remove: this.removeListener.bind(this, id) };
    }

    private removeListener(id: number) {
        delete this.listeners[id];
        let tempListeners = this.listeners.filter(x => x !== undefined);
        if (tempListeners.length === 0) {
            this.listeners = tempListeners;
            this.uniqId = 0;
        }
    }

    public Emit(action: any | Object) {
        this.listeners.forEach((listener) => {
            if (action instanceof listener.Action) {
                listener.Callback(action);
            } else if (listener.Action === "*") {
                listener.Callback(action);
            }
        });
    }

}

export default new ActionsEmitter();