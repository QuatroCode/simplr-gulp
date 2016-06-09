var logger_1 = require('./logger');
var gulp = require('gulp');
gulp.task("default", function () {
    console.log("COOL");
    logger_1.default.error("Test error messsage", "HAHA");
    logger_1.default.info("Test info message");
    logger_1.default.log("Test log message");
    logger_1.default.warn("Test warning message");
});