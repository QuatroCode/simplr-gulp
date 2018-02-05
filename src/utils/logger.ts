import { colors, log } from "gulp-util";

enum LogType {
    Default,
    Error,
    Info,
    Warning
}

class LoggerType {
    constructor(private type: string) {}

    public get Type(): string {
        return this.type;
    }
}

export class Logger {
    private showMessage(type: LogType, loggerType: LoggerType | undefined, ...messages: any[]): void {
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
            typeString = `${typeString} ${loggerType.Type}`;
        }

        if (!isDefaultLogType || loggerType !== undefined) {
            typeString = typeString + ":";
        }

        const resolvedMessages = this.discernWords(type, color, ...messages);

        log(`${colors.styles.bold.open}${color}${typeString}${resolvedMessages.join(" ")}`, colors.styles.reset.open);
    }

    private discernWords(type: LogType, ...messages: Array<string | any>): Array<string | any> {
        if (type === LogType.Default || type === LogType.Info) {
            const resolveMessages = messages.map(message => {
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

    private getLoggerTypeFromMessages(messages: any[]): any {
        return messages[0] instanceof LoggerType ? messages.shift() : undefined;
    }

    public log(...messages: any[]): void {
        const loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Default, loggerType, ...messages);
    }

    public error(...messages: any[]): void {
        const loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Error, loggerType, ...messages);
    }

    public info(...messages: any[]): void {
        const loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Info, loggerType, ...messages);
    }

    public warn(...messages: any[]): void {
        const loggerType = this.getLoggerTypeFromMessages(messages);
        this.showMessage(LogType.Warning, loggerType, ...messages);
    }

    // tslint:disable-next-line:typedef
    public withType(type: string) {
        const loggerType = new LoggerType(type);
        return {
            log: this.log.bind(this, loggerType),
            error: this.error.bind(this, loggerType),
            info: this.info.bind(this, loggerType),
            warn: this.warn.bind(this, loggerType)
        };
    }
}

export const LoggerInstance = new Logger();
