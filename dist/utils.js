var fs = require('fs');
function WriteToFileAsJson(fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content, null, 4));
}
exports.WriteToFileAsJson = WriteToFileAsJson;
function GetTimeNow() {
    var date = new Date(), hours = this.pad(date.getHours(), 2), minutes = this.pad(date.getMinutes(), 2), seconds = this.pad(date.getSeconds(), 2);
    return hours + ":" + minutes + ":" + seconds;
}
exports.GetTimeNow = GetTimeNow;
