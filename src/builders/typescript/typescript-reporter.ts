import * as ts from "gulp-typescript";
import * as path from "path";
import { LoggerInstance } from "../../utils/logger";


export function LogTypeScriptError(fileName: string, startPosition: number, characterCount: number, messageText: string | any) {
    LoggerInstance.withType("TS").error(`${fileName}[${startPosition}, ${characterCount}]: `, messageText);
}


export class Reporter implements ts.Reporter {
    error(error: any) {
        if (error.tsFile) {
            let fileName = error.relativeFilename || error.tsFile.fileName;
            fileName = path.normalize(fileName);

            let messageText = (typeof error.diagnostic.messageText === "string") ? error.diagnostic.messageText : error.diagnostic.messageText.messageText;

            LogTypeScriptError(fileName, error.startPosition.line, error.startPosition.character, messageText);
        } else {
            LoggerInstance.withType("TS").error(error.message);
        }
    }
}
