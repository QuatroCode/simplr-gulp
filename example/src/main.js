var gulp = require('gulp');
var server_1 = require('./server');
gulp.task("default", function (done) {
});
gulp.task("_server", function (done) {
    var server = new server_1.default();
    server.Listener.on("close", function () {
        done();
    });
});
