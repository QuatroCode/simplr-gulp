import * as express from 'express';
import * as http from 'http';
import { RequestHandler } from 'express-serve-static-core';
import Logger from './utils/logger';
import Configuration from './configuration/configuration';
import { spawn } from 'child_process';

export default class ServerStarter {
    public server = express();

    Listener: http.Server;

    private get isQuiet() {
        return (process.argv.findIndex(x => x === "--quiet") !== -1 || process.argv.findIndex(x => x === "-Q") !== -1);
    }

    constructor() {
        let {ServerConfig, Directories} = Configuration.GulpConfig;
        let serverUrl = `http://${ServerConfig.Ip}:${ServerConfig.Port}`;
        this.openBrowser(serverUrl);
        this.server.use(express.static(Directories.Build));
        this.Listener = this.server.listen(ServerConfig.Port);
        this.addListeners();
        Logger.info(`Server started at '${serverUrl}'`);
    }

    private openBrowser(serverUrl: string) {
        if (!this.isQuiet) {
            spawn('explorer', [serverUrl]);
        }
    }

    private onRequest: RequestHandler = (req, res) => {
        let { Build } = Configuration.GulpConfig.Directories;
        res.sendFile('index.html', { root: Build });
    }

    private addListeners() {
        this.Listener.once("close", this.onClose);
        this.Listener.once('error', this.onError);
        this.server.all('/*', this.onRequest);
    }

    private onClose = () => {
        Logger.info(`Server closed.`);
    }

    private onError = (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            Logger.error(`Port ${Configuration.GulpConfig.ServerConfig.Port} already in use.`);
            this.Listener.close();
        } else {
            Logger.error(`Exeption not handled. Please create issues with error code "${err.code}" here: https://github.com/QuatroCode/simplr-gulp/issues \n`, err);
        }
    }
}
