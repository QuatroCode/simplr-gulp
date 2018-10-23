import * as colors from "ansi-colors";
import * as log from "fancy-log";

enum LogType {
    Default,
    Error,
    Info,
    Warning
}

class LoggerType {
    constructor(private type: string) {}

    get Type() {
        return this.type;
    }
}

export class Logger {
    private showMessage(type: LogType, loggerType: LoggerType | undefined, ...messages: Array<any>) {
        let isDefaultLogType = false;

        let color, typeString;

        switch (type) {
            case LogType.Error:
                {
                    color = colors.styles.red.open;
                }
                break;
            case LogType.Info:
                {
                    color = colors.styles.cyan.open;
                }
                break;
            case LogType.Warning:
                {
                    color = colors.styles.yellow.open;
                }
                break;
            default: {
                color = colors.styles.white.open;
                isDefaultLogType = true;
            }
        }

        if (!isDefaultLogType) {
            typeString = LogType[type].toLocaleUpperCase();
        } else {
            typeString = "";
        }

        if (loggerType !== undefined) {
            typeString = typeString + " " + loggerType.Type;
        }

        if (!isDefaultLogType || loggerType !== undefined) {
            typeString = typeString + ":";
        }

        let resolvedMessages = this.discernWords(type, color, ...messages);

        log(`${colors.styles.bold.open}${color}${typeString}${resolvedMessages.join(" ")}`, colors.styles.reset.open);
    }

    private discernWords(type: LogType, ...messages: Array<string | any>): Array<string | any> {
        if (type === LogType.Default || type === LogType.Info) {
            let resolveMessages = messages.map(message => {
                if (typeof message === "string") {
                    let msg: string = message;
                    let openColor = true;
                    while (msg.search("'") !== -1) {
                        if (openColor) {
                            openColor = !openColor;
                            msg = msg.replace("'", colors.styles.magenta.open);
                        } else {
                            openColor = !openColor;
                            msg = msg.replace("'", colors.styles.magenta.close);
                        }
                    }
                    return msg;
                }
                return message;
            });
            return resolveMessages;
        } else {
            return messages;
        }
    }

    private getLoggerTypeFromMessages(messages: Array<any>) {
        return messages[0] instanceof LoggerType ? messages.shift() : undefined;
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
