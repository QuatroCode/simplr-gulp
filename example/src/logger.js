var Colors = require('colors/safe');
var utils_1 = require('./utils');
var LogType;
(function (LogType) {
    LogType[LogType["Default"] = 0] = "Default";
    LogType[LogType["Error"] = 1] = "Error";
    LogType[LogType["Info"] = 2] = "Info";
    LogType[LogType["Warning"] = 3] = "Warning";
})(LogType || (LogType = {}));
var Console = (function () {
    function Console() {
        this.styles = Colors.styles;
    }
    Console.prototype.getTimeNowWithStyles = function () {
        return "[" + this.styles.grey.open + utils_1.GetTimeNow() + this.styles.grey.close + "]";
    };
    Console.prototype.showMessage = function (type) {
        var message = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            message[_i - 1] = arguments[_i];
        }
        var typeString = " " + LogType[type].toLocaleUpperCase() + ":";
        var log = console.log;
        var color = this.styles.white.open;
        switch (type) {
            case LogType.Error:
                {
                    color = this.styles.red.open;
                    log = console.error;
                }
                break;
            case LogType.Info:
                {
                    color = this.styles.cyan.open;
                    log = console.info;
                }
                break;
            case LogType.Warning:
                {
                    color = this.styles.yellow.open;
                    log = console.warn;
                }
                break;
            default: {
                typeString = "";
            }
        }
        log.apply(void 0, ["" + this.getTimeNowWithStyles() + this.styles.bold.open + color + typeString].concat(message, [this.styles.reset.open]));
    };
    Console.prototype.log = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Default].concat(message));
    };
    Console.prototype.error = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Error].concat(message));
    };
    Console.prototype.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Info].concat(message));
    };
    Console.prototype.warn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.showMessage.apply(this, [LogType.Warning].concat(message));
    };
    return Console;
}());
var logger = new Console();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logger;
