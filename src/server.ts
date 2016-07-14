import * as express from 'express';
import * as http from 'http';
import { RequestHandler } from 'express-serve-static-core';
import Logger from './utils/logger';
import Configuration from './configuration/configuration';


class ServerStarter {
    public server = express();

    Listener: http.Server;

    constructor() {
        let {ServerConfig, Directories} = Configuration.GulpConfig;
        Logger.info(`Server started at ${ServerConfig.Ip}:${ServerConfig.Port}`);

        this.server.use(express.static(Directories.Build));
        this.Listener = this.server.listen(ServerConfig.Port);
        this.addListeners();
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
            Logger.error("Exeption not handled. Please create issues with error code: \n", err);
        }
    }
}

export default ServerStarter;