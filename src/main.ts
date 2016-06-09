import Logger from './logger';
import * as gulp from 'gulp';
import Configuration from './configuration';
import Server from './server';



gulp.task("default", (done) => {

});


gulp.task("_server", (done) => {
    let server = new Server();
    server.Listener.on("close", () => {
        done();
    });
});

