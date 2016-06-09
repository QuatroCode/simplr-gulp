var fs = require('fs');
function WriteToFileAsJson(fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content, null, 4));
}
exports.WriteToFileAsJson = WriteToFileAsJson;
function Pad(num, size) {
    var s = "000000000" + num.toString();
    return s.substr(s.length - size);
}
exports.Pad = Pad;
function GetTimeNow() {
    var date = new Date(), hours = Pad(date.getHours(), 2), minutes = Pad(date.getMinutes(), 2), seconds = Pad(date.getSeconds(), 2);
    return hours + ":" + minutes + ":" + seconds;
}
exports.GetTimeNow = GetTimeNow;
