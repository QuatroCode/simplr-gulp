import * as fs from "fs";
import * as path from "path";

/**
 * Write JSON object to file
 */
export function WriteToFileAsJson(fileName: string, content: Object): void {
    fs.writeFile(fileName, JSON.stringify(content, null, 4), err => {
        console.error(err);
    });
}

/**
 * Pad number with zeros
 */
export function Pad(num: number, size: number): string {
    const s = "000000000" + num.toString();
    return s.substr(s.length - size);
}

/**
 * Generate and return time at the moment
 *
 * @returns HH:ii:ss
 */
export function GetTimeNow(): string {
    const date = new Date();
    const hours = Pad(date.getHours(), 2);
    const minutes = Pad(date.getMinutes(), 2);
    const seconds = Pad(date.getSeconds(), 2);

    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Remove full directory path name
 *
 * @export
 * @param {string} directory
 * @returns {string} Path
 */
export function RemoveFullPath(directory: string): string {
    return directory.split(`${__dirname}\\`)[1];
}

export function Ensure(...element: any[]): void {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(element));
}

/**
 * Get class name from constructor
 *
 * @export
 * @param {Function} constructor
 * @returns
 */
export function GetClassName(constructor: Function): string {
    if (constructor != null) {
        const functionString = constructor.toString();
        if (functionString.length > 0) {
            const match = functionString.match(/\w+/g);
            if (match != null && match[1] != null) {
                return match[1];
            }
        }
    }
    return "";
}

/**
 * Replace all matches by regex.
 *
 * @export
 * @param {string} content
 * @param {string} search
 * @param {string} replace
 * @returns
 */
export function ReplaceAll(content: string, regexSearch: RegExp | string, replace: string): string {
    return content.replace(new RegExp(regexSearch as string), replace);
}

export function FixSeparator(link: string): string {
    const correctSep = "/";
    const wrongSeps = ["\\"];
    if (path.sep !== correctSep && wrongSeps.indexOf(path.sep) === -1) {
        wrongSeps.push(path.sep);
    }
    for (let i = 0; i < wrongSeps.length; i++) {
        const wrongSep = wrongSeps[i];
        while (link.indexOf(wrongSep) !== -1) {
            link = link.replace(wrongSep, correctSep);
        }
    }
    return link;
}

export interface TimedPromiseResult<TPromiseResult> {
    Result: TPromiseResult;
    Elapsed: number;
}
export async function TimePromise<TPromiseResult>(
    promiseFactory: () => Promise<TPromiseResult>
): Promise<TimedPromiseResult<TPromiseResult>> {
    const start = +new Date();
    const result = await promiseFactory();
    const end = +new Date();
    return {
        Result: result,
        Elapsed: end - start
    };
}
