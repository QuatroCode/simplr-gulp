import * as Colors from 'colors/safe';
import { GetTimeNow } from './helpers';

enum LogType {
    Default,
    Error,
    Info,
    Warning
}

class Console {

    private styles = Colors.styles;

    private getTimeNowWithStyles() {
        return `[${this.styles.grey.open}${GetTimeNow()}${this.styles.grey.close}]`;
    }

    private showMessage(type: LogType, ...messages: Array<any>) {
        let typeString = ` ${LogType[type].toLocaleUpperCase()}:`;
        let log = console.log;
        let color = this.styles.white.open;
        switch (type) {
            case LogType.Error: {
                color = this.styles.red.open;
                log = console.error;
            } break;
            case LogType.Info: {
                color = this.styles.cyan.open;
                log = console.info;
            } break;
            case LogType.Warning: {
                color = this.styles.yellow.open;
                log = console.warn;
            } break;
            default: {
                typeString = "";
            }
        }
        this.discernWords(type, color, ...messages).then((resolvedMessages) => {
            log(`${this.getTimeNowWithStyles()}${this.styles.bold.open}${color}${typeString}`, ...resolvedMessages, this.styles.reset.open);
        });
    }

    private async discernWords(type: LogType, color: string, ...messages: Array<string | any>) {
        return new Promise<Array<any>>(resolve => {
            if (type === LogType.Default || type === LogType.Info) {

                let resolveMessages = messages.map(message => {
                    if (typeof message === 'string') {
                        let msg: string = message;
                        let openColor = true;
                        while (msg.search("'") !== -1) {
                            if (openColor) {
                                openColor = !openColor;
                                msg = msg.replace("'", this.styles.magenta.open);
                            } else {
                                openColor = !openColor;
                                msg = msg.replace("'", color);
                            }
                        }
                        return msg;
                    }
                    return message;
                });
                resolve(resolveMessages);
            } else {
                resolve(messages);
            }
        });
    }

    log(...message: Array<any>) {
        this.showMessage(LogType.Default, ...message);
    }

    error(...message: Array<any>) {
        this.showMessage(LogType.Error, ...message);
    }

    info(...message: Array<any>) {
        this.showMessage(LogType.Info, ...message);
    }

    warn(...message: Array<any>) {
        this.showMessage(LogType.Warning, ...message);
    }
}

let logger = new Console();
export default logger; 