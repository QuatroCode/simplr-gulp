import * as fs from 'fs';
import * as path from 'path';


/**
 * Write in file in JSON format
 * 
 */
export function WriteToFileAsJson(fileName: string, content: Object): void {
    fs.writeFile(fileName, JSON.stringify(content, null, 4));
}



/**
 * Pad number with zeros
 */
export function Pad(num: number, size: number): string {
    var s = "000000000" + num.toString();
    return s.substr(s.length - size);
}

/**
 * Generate and return time at the moment
 * @return HH:ii:ss
 */
export function GetTimeNow(): string {
    let date = new Date(),
        hours = Pad(date.getHours(), 2),
        minutes = Pad(date.getMinutes(), 2),
        seconds = Pad(date.getSeconds(), 2);
    return `${hours}:${minutes}:${seconds}`;
}
