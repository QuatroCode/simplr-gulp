var gulp = require('gulp');
var server_1 = require('./server');
var watcher_1 = require('./watcher');
gulp.task("default", function (done) {
    var watcher = new watcher_1.default();
});
gulp.task("_server", function (done) {
    var server = new server_1.default();
    server.Listener.on("close", function () {
        done();
    });
});
