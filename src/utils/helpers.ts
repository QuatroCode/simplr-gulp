import * as fs from 'fs';
import * as path from 'path';

/**
 * Write JSON object to file
 * 
 * @export
 * @param {string} fileName
 * @param {Object} content
 */
export function WriteToFileAsJson(fileName: string, content: Object): void {
    fs.writeFile(fileName, JSON.stringify(content, null, 4), (error) => {
        console.error(error);   
    });
}

/**
 * Pad number with zeros
 * 
 * @export
 * @param {number} num
 * @param {number} size
 * @returns {string} 
 */
export function Pad(num: number, size: number): string {
    var s = "000000000" + num.toString();
    return s.substr(s.length - size);
}

/**
 * Generate and return time at the moment
 * 
 * @export
 * @returns {string} HH:ii:ss
 */
export function GetTimeNow(): string {
    let date = new Date(),
        hours = Pad(date.getHours(), 2),
        minutes = Pad(date.getMinutes(), 2),
        seconds = Pad(date.getSeconds(), 2);
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


export function Ensure(...element: Array<any>) {
    console.log(JSON.stringify(element));
}

/**
 * Get class name from constructor
 * 
 * @export
 * @param {Function} constructor
 * @returns
 */
export function GetClassName(constructor: Function) {
    if (constructor != null) {
        let functionString = constructor.toString();
        if (functionString.length > 0) {
            let match = functionString.match(/\w+/g);
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
export function ReplaceAll(content: string, regexSearch: RegExp | string, replace: string) {
    return content.replace(new RegExp(regexSearch as string), replace);
};


export function FixSeparator(link: string) {
    const correctSep = "/";
    let wrongSeps = ["\\"];
    if (path.sep !== correctSep && wrongSeps.indexOf(path.sep) === -1) {
        wrongSeps.push(path.sep);
    }
    for (let i = 0; i < wrongSeps.length; i++) {
        let wrongSep = wrongSeps[i];
        while (link.indexOf(wrongSep) !== -1) {
            link = link.replace(wrongSep, correctSep);
        }
    }
    return link;
}
