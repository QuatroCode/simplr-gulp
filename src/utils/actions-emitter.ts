interface Listener {
    Callback: Function;
    Action: any | Object;
}

export class ActionsEmitterClass {
    private listeners: Listener[] = [];
    private uniqId: number = 0;

    private get UniqueId(): number {
        return this.uniqId++;
    }

    public On(action: any, callback: Function): {} {
        const id = this.UniqueId;
        this.listeners[id] = { Action: action, Callback: callback };
        return { remove: this.removeListener.bind(this, id) };
    }

    private removeListener(id: number): void {
        delete this.listeners[id];
        const tempListeners = this.listeners.filter(x => x !== undefined);
        if (tempListeners.length === 0) {
            this.listeners = tempListeners;
            this.uniqId = 0;
        }
    }

    public Emit(action: any | Object): void {
        this.listeners.forEach(listener => {
            if (action instanceof listener.Action) {
                listener.Callback(action);
            } else if (listener.Action === "*") {
                listener.Callback(action);
            }
        });
    }
}

export const ActionsEmitter = new ActionsEmitterClass();
