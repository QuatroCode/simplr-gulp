import { log } from "gulp-util";

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

export class LoggerClass {
    // FIXME: Colors.
    private showMessage(type: LogType, loggerType: LoggerType | undefined, ...messages: any[]): void {
        const isDefaultLogType = false;
        // let color
        let typeString: string;

        // switch (type) {
        //     case LogType.Error:
        //         {
        //             color = colors.red;
        //         }
        //         break;
        //     case LogType.Info:
        //         {
        //             color = colors.cyan;
        //         }
        //         break;
        //     case LogType.Warning:
        //         {
        //             color = colors.yellow;
        //         }
        //         break;
        //     default: {
        //         color = colors.white;
        //         isDefaultLogType = true;
        //     }
        // }

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

        // const resolvedMessages = this.discernWords(type, ...messages);

        log(`${typeString}${messages.join(" ")}`);
    }

    // private discernWords(type: LogType, ...messages: Array<string | any>): Array<string | any> {
    //     if (type === LogType.Default || type === LogType.Info) {
    //         const resolveMessages = messages.map(message => {
    //             if (typeof message === "string") {
    //                 let msg: string = message;
    //                 let openColor = true;
    //                 while (msg.search("'") !== -1) {
    //                     if (openColor) {
    //                         openColor = !openColor;
    //                         msg = msg.replace("'", colors.magenta);
    //                     } else {
    //                         openColor = !openColor;
    //                         msg = msg.replace("'", colors.magenta);
    //                     }
    //                 }
    //                 return msg;
    //             }
    //             return message;
    //         });
    //         return resolveMessages;
    //     } else {
    //         return messages;
    //     }
    // }

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

export const Logger = new LoggerClass();
