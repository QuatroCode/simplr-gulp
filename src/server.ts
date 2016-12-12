import * as express from 'express';
import * as http from 'http';
import { RequestHandler } from 'express-serve-static-core';
import Logger from './utils/logger';
import Configuration from './configuration/configuration';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import * as path from "path";
import * as connectLiveReload from 'connect-livereload';
import * as tinyLr from 'tiny-lr';
import ActionsEmitter, { } from './utils/actions-emitter';
import { ReloadFiles, ReloadPage } from './actions/live-reload/live-reload-actions';

export default class ServerStarter {
    public server = express();
    public liveReloadServer = tinyLr({});

    Listener: http.Server;

    private actionsListeners = new Array<{ remove: () => void }>();

    private get isQuiet() {
        return (process.argv.findIndex(x => x === "--quiet") !== -1 || process.argv.findIndex(x => x === "-Q") !== -1);
    }

    constructor() {
        let {ServerConfig, Directories} = Configuration.GulpConfig;
        let serverUrl = `http://${ServerConfig.Ip}:${ServerConfig.Port}`;
        this.configureServer(Directories.Build);
        this.startListeners(ServerConfig.Port, ServerConfig.LiveReloadPort);
        this.addEventListeners();
        this.openBrowser(serverUrl);
        Logger.info(`Server started at '${serverUrl}'`);
        this.addActionsListeners();
    }

    private addActionsListeners() {
        this.actionsListeners.push(ActionsEmitter.On(ReloadFiles, this.onReloadFilesList));
        this.actionsListeners.push(ActionsEmitter.On(ReloadPage, this.onReloadPage));
    }

    private removeActionsListeners() {
        this.actionsListeners.forEach(x => { x.remove(); });
        this.actionsListeners = new Array();
    }

    private onReloadFilesList = (action: ReloadFiles) => {
        this.reloadFiles(action.FilesNames.join(","));
    }

    private onReloadPage = (action: ReloadPage) => {
        this.reloadFiles("index.html");
    }

    private reloadFiles(files: string) {
        http.get({
            hostname: Configuration.GulpConfig.ServerConfig.Ip,
            port: Configuration.GulpConfig.ServerConfig.LiveReloadPort,
            path: `/changed?files=${files}`,
            agent: false
        });
    }


    private configureServer(wwwroot: string) {
        this.server.use(connectLiveReload({ port: Configuration.GulpConfig.ServerConfig.LiveReloadPort }));
        this.server.use(express.static(wwwroot));
    }

    private startListeners(serverPort: number, liveReloadServerPort: number) {
        this.Listener = this.server.listen(serverPort);
        this.liveReloadServer.listen(liveReloadServerPort);
    }


    private openBrowser(serverUrl: string) {
        if (!this.isQuiet) {
            let opener = '';
            switch (process.platform) {
                case 'darwin':
                    opener = 'open';
                    break;
                case 'win32':
                    opener = 'start ""';
                    break;
                default:
                    opener = path.join(__dirname, '../vendor/xdg-open');
                    break;
            }

            if (process.env.SUDO_USER) {
                opener = `sudo -u ${process.env.SUDO_USER} ${opener}`;
            }
            try {
                exec(`opener "${serverUrl}"`);
            } catch (error) {
                Logger.error("Error with openBrowser.", error);
                Logger.info("Please create new issue here: https://github.com/quatrocode/simplr-gulp/issues");
            }
        }
    }

    private onRequest: RequestHandler = (req, res) => {
        let { Build } = Configuration.GulpConfig.Directories;
        res.sendFile('index.html', { root: Build });
    }

    private addEventListeners() {
        this.Listener.once("close", this.onClose);
        this.Listener.once('error', this.onError);
        this.server.all('/*', this.onRequest);
    }

    private onClose = () => {
        Logger.info(`Server closed.`);
        this.removeActionsListeners();
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
