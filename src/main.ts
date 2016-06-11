import Logger from './logger';
import * as gulp from 'gulp';
import Configuration from './configuration';
import Server from './server';
import Watcher from './watcher';


gulp.task("default", (done) => {

    let watcher = new Watcher();
    
});


gulp.task("_server", (done) => {
    let server = new Server();
    server.Listener.on("close", () => {
        done();
    });
});

