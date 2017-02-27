import * as Colors from 'colors/safe';
import { GetTimeNow } from './helpers';

enum LogType {
    Default,
    Error,
    Info,
    Warning
}

class LoggerType {
    constructor(private type: string) {
    }

    get Type() {
        return this.type;
    }
}

export class Logger {

    private styles = (Colors as any).styles;

    private getTimeNowWithStyles() {
        return `[${this.styles.grey.open}${GetTimeNow()}${this.styles.grey.close}]`;
    }

    private showMessage(type: LogType, loggerType: LoggerType | undefined, ...messages: Array<any>) {
        let typeString = ` ${LogType[type].toLocaleUpperCase()}`;
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

        if (loggerType !== undefined) {
            typeString = typeString + " " + loggerType.Type;
        }
        if (log !== console.log) {
            typeString = typeString + ":";
        }

        let resolvedMessages = this.discernWords(type, color, ...messages);
        log(`${this.getTimeNowWithStyles()}${this.styles.bold.open}${color}${typeString}`, ...resolvedMessages, this.styles.reset.open);
    }

    private discernWords(type: LogType, color: string, ...messages: Array<string | any>): Array<string | any> {
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
            return (resolveMessages);
        } else {
            return (messages);
        }
    }

    private getLoggerTypeFromMessages(messages: Array<any>) {
        return (messages[0] instanceof LoggerType) ? messages.shift() : undefined;
    }

    log(...messages: Array<any>) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Default, loggerType, ...messages);
    }

    error(...messages: Array<any>) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Error, loggerType, ...messages);
    }

    info(...messages: Array<any>) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Info, loggerType, ...messages);
    }

    warn(...messages: Array<any>) {
        let loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Warning, loggerType, ...messages);
    }

    withType(type: string) {
        let loggerType = new LoggerType(type);
        return {
            log: this.log.bind(this, loggerType),
            error: this.error.bind(this, loggerType),
            info: this.info.bind(this, loggerType),
            warn: this.warn.bind(this, loggerType)
        };
    }
}

export let LoggerInstance = new Logger();
export default LoggerInstance; 