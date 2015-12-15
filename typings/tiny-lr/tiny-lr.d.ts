/// <reference path="../node/node.d.ts"/>

declare module 'tiny-lr' {
    import * as http from "http";

    interface CallBack {
        (request: http.IncomingMessage, response: http.IncomingMessage): void;
    }

    interface Options extends http.RequestOptions {

    }

    class Server {
        constructor(options?: Options);
        listen(port: number, callBack: Function): void;
        on(request: string, callBack: CallBack): void;

    }


    interface tinylrBase {
        (options?: Options): http.Server;
        middleware({ app: app }): void;
    }

    var tinylr: tinylrBase;
    
    export = tinylr;
}
