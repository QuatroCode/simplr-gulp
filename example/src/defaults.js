exports.DEFAULT_TYPESCRIPT_CONFIG = {
    compilerOptions: {
        module: "commonjs",
        target: "es5",
        noImplicitAny: true,
        preserveConstEnums: true,
        removeComments: false,
        sourceMap: true,
        inlineSources: true
    },
    exclude: [
        "node_modules",
        "src/libs"
    ]
};
exports.DEFAULT_GULP_CONFIG = {
    Directories: {
        Source: "src",
        Build: "wwwroot",
        App: "app"
    },
    TypeScriptConfig: {
        Development: "tsconfig.json",
        Production: "tsconfig.production.json"
    },
    ServerConfig: {
        Ip: "127.0.0.1",
        Port: 4000,
        LiveReloadPort: 4400
    },
    BundleConfig: {
        AppFile: "app.js",
        BuildFile: "build.js",
        Include: [],
        Exclude: ['[wwwroot/js/app/**/*]']
    },
    WebConfig: null,
    CfgVersion: 2.02
};
exports.DEFAULT_EXTENSIONS_MAP = {
    "ts": "js",
    "tsx": "js",
    "scss": "css",
    ".ts": ".js",
    ".tsx": ".js",
    ".scss": ".css"
};
