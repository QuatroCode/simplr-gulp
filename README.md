# simplr-gulp

### I just want to use gulpfile.js
Simply copy [build/gulpfile.js](https://github.com/QuatroCode/simplr-gulp/blob/master/build/gulpfile.js) to your project and run task:
```
gulp
```
Which will run `gulp default` task and start watching your files (`*.ts`, `*.scss`, `index.html`, `configs`, etc.) and compiling them from source to build directory. Also it starts server tailored for Single Page Application.

All directories, server and live-reload settings are configured in `gulpconfig.json`.

After first run, `gulpconfig.json` file will be generated for you to edit for your own use.

### Available commands:
**Main tasks**
* `:build` - compiles files (`*.ts`, `*.scss`, `index.html`, `configs`, etc.)
* `:buid:prod` - compiles, minifies and uglifies files (`*.ts`, `*.scss`, `index.html`, `configs`, etc.)
* `:clean` - cleans build directory (`wwwroot` by default)
* `:bundle` - bundles the app with `jspm bundle`
* `:bundle:prod`: bundles the app with `jspm budle` and minifies bundle file

**Specific tasks**
* `_html` - copies `index.html` file from source to build directory
* `_ts` - compiles TypeScript from source to build directory
* `_ts:prod` - compiles, minifies and uglifies TypeScript from source to build
* `_sass` - compiles SCSS files from source to build directory
* `_sass:prod` - compiles and minifies SCSS files from source to build directory
* `_assets` - copies all `assets` folders and their contents from source to build directory
* `_configs` - copies `web.config` (for Asp.Net 5 projects) and JSPM `config.js` from source to build directory

### Prerequisites
You need global npm packages ([`gulp`](https://github.com/gulpjs/gulp), [`tsd`](https://github.com/DefinitelyTyped/tsd), [`jspm`](https://github.com/jspm/jspm-cli))):

1. `npm install gulp -g`
2. `npm install tsd -g`
3. `npm install jspm -g`

## Trying it yourself
1. `git clone https://github.com/QuatroCode/simplr-gulp.git`
2. `cd simplr-gulp/tests`
3. `npm install`
4. `jspm install`
5. `gulp`
6. Go to [http://localhost:4000](http://localhost:4000)

## Default `gulpconfig.json` (can be customized)
```json
{
    "Directories": {
        "Source": "src",
        "Build": "wwwroot",
        "App": "app"
    },
    "TypeScriptConfig": {
        "Development": "tsconfig.json",
        "Production": "tsconfig.production.json"
    },
    "ServerConfig": {
        "Ip": "127.0.0.1",
        "Port": 4000,
        "LiveReloadPort": 4400
    },
    "BundleConfig": {
        "AppFile": "app.js",
        "BuildFile": "build.js",
        "Include": [],
        "Exclude": [
            "[wwwroot/js/app/**/*]"
        ]
    },
    "ExtensionsMap": {
        "ts": "js",
        "tsx": "js",
        "scss": "css"
    },
    "WebConfig": "web.config",
    "CfgVersion": 2.01
}
```

## Development
#### If you want to update gulpfile.ts yourself
1. `git clone https://github.com/QuatroCode/simplr-gulp.git`
2. `cd simplr-gulp`
3. `npm install`
3. `tsd reinstall`
4. `npm run watch` (or `npm run build` for one time compilation)
5. Make changes
