import * as express from 'express';
import Console from './logger';
import Configuration from './configuration';
import * as http from 'http';
import { RequestHandler } from 'express-serve-static-core';


export default class ServerStarter {
    public server = express();

    Listener: http.Server;

    constructor() {
        let {ServerConfig, Directories} = Configuration.GulpConfig;
        Console.info(`Server started at ${ServerConfig.Ip}:${ServerConfig.Port}`);
     
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
        Console.info(`Server closed.`);
    }

    private onError = (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            Console.error(`Port ${Configuration.GulpConfig.ServerConfig.Port} already in use.`);
            this.Listener.close();
        } else {
            Console.error("Exeption not handled. Please create issues with error code: \n", err);
        }
    }
}