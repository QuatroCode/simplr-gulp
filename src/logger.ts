import * as Colors from 'colors/safe';
import { GetTimeNow } from './utils';

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

    private showMessage(type: LogType, ...message: Array<any>) {
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
        log(`${this.getTimeNowWithStyles()}${this.styles.bold.open}${color}${typeString}`, ...message, this.styles.reset.open);
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