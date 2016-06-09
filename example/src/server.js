var express = require('express');
var logger_1 = require('./logger');
var configuration_1 = require('./configuration');
var ServerStarter = (function () {
    function ServerStarter() {
        var _this = this;
        this.server = express();
        this.onRequest = function (req, res) {
            var Build = configuration_1.default.GulpConfig.Directories.Build;
            res.sendFile('index.html', { root: Build });
        };
        this.onClose = function () {
            logger_1.default.info("Server closed.");
        };
        this.onError = function (err) {
            if (err.code === 'EADDRINUSE') {
                logger_1.default.error("Port " + configuration_1.default.GulpConfig.ServerConfig.Port + " already in use.");
                _this.Listener.close();
            }
            else {
                logger_1.default.error("Exeption not handled. Please create issues with error code: \n", err);
            }
        };
        var _a = configuration_1.default.GulpConfig, ServerConfig = _a.ServerConfig, Directories = _a.Directories;
        logger_1.default.info("Server started at " + ServerConfig.Ip + ":" + ServerConfig.Port);
        this.server.use(express.static(Directories.Build));
        this.Listener = this.server.listen(ServerConfig.Port);
        this.addListeners();
    }
    ServerStarter.prototype.addListeners = function () {
        this.Listener.once("close", this.onClose);
        this.Listener.once('error', this.onError);
        this.server.all('/*', this.onRequest);
    };
    return ServerStarter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServerStarter;
