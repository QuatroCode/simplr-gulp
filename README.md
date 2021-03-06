# simplr-gulp 
[![NPM version](http://img.shields.io/npm/v/simplr-gulp.svg)](https://www.npmjs.com/package/simplr-gulp) [![Build Status](https://travis-ci.org/QuatroCode/simplr-gulp.svg?branch=master)](https://travis-ci.org/QuatroCode/simplr-gulp) [![dependencies Status](https://david-dm.org/quatrocode/simplr-gulp/status.svg)](https://david-dm.org/quatrocode/simplr-gulp) [![devDependencies Status](https://david-dm.org/quatrocode/simplr-gulp/dev-status.svg)](https://david-dm.org/quatrocode/simplr-gulp?type=dev) [![peerDependencies Status](https://david-dm.org/quatrocode/simplr-gulp/peer-status.svg)](https://david-dm.org/quatrocode/simplr-gulp?type=peer)

### I just want to use gulpfile.js
1) Install `simplr-gulp` in your project: 
```cmd
npm install simplr-gulp --save-dev
```
2) Create `gulpfile.js` in your project root directory:
```js
require('simplr-gulp');
```
3) Start command:
```cmd
gulp -T
```
Which will show all available commands.

All directories, server and live-reload settings are configured in `gulpconfig.json`.

After first run, `gulpconfig.json` file will be generated for you to edit for your own use.

### Requirements
* [NodeJS](https://nodejs.org): `>= 6.0.0`
* [Typescript](http://www.typescriptlang.org/): `^1.8.10 || ^2.0.0`

### Available commands
#### Gulp tasks
* `default` - start `Watch` task with server.
* `Build` - compiles source files with development environment (starts all `Build.*` subtasks)
    * `Build.Assets` - copies all `assets` folders and their contents from source to build directory
    * `Build.Configs` - copies `configs` folder from source to build directory with jspm environment
        * `Build.Configs.Files` - copy `jspm.config.js` file from source to build directory with production environment (production only)
        * `Build.Configs.Folders` - copies configs folder from source to build directory
    * `Build.Html` - copies all `*.html` files from source to build directory
    * `Build.Scripts` - compiles TypeScript with sourcemap from source to build directory
        * `Build.Scripts.Typescript` - compiles TypeScript with sourcemap from source to build directory
        * `Build.Scripts.Tslint` - check for tslint warnings
    * `Build.Styles` - compiles `*.scss` files from source to build directory

* `Build:Production` - compiles, minifies and uglifies source files with production environment (starts all `Build.*:Production` subtasks)
    * `Build.Assets:Production` - copies all `assets` folders and their contents from source to build directory
    * `Build.Configs:Production` - copies `web.config` (for Asp.Net 5 projects) and `configs` folder from source to build directory
    * `Build.Html:Production` - copies all `*.html` files from source to build directory
    * `Build.Scripts:Production` - compiles TypeScript from source to build directory
        * `Build.Scripts.Typescript:Production` - compiles TypeScript from source to build directory
        * `Build.Scripts.Tslint:Production` - check for tslint warnings
    * `Build.Styles:Production` - compiles and minifies `*.scss` files from source to build directory


* `Watch` - watch source files, start tasks (all `Watch.*` subtasks) and call live reload action.
    * `Watch.Assets` - start task `Build.Assets`
    * `Watch.Configs` - start task `Build.Configs`
    * `Watch.Html` - start task `Build.Html`
    * `Watch.Scripts` - start task `Build.Script`
    * `Watch.Styles` - start task `Build.Styles`

> **`Watch.*` subtasks available only at runtime.**

* `Bundle` - bundles the app with `jspm bundle` with development environment

* `Jspm.CdnPaths:Production` - Generate CDN paths ([https://cdnjs.com](cdnjs.com)) into [src/configs/jspm.config.production.js](example/src/configs/jspm.config.production.js) using npm registry

* `Clean` - cleans build directory (`wwwroot` by default) without `wwwroot/libs` folder and `wwwroot/**/.gitkeep` files
    * `Clean.All` - cleans build directory (`wwwroot` by default) without `wwwroot/**/.gitkeep` files
    * `Clean.Bundle` - remove build file (`build.js` by default) from build directory (`wwwroot` by default)
    * `Clean.Libs` - cleans libs directory (`wwwroot/libs` by default)

## Trying it yourself
1. `git clone https://github.com/QuatroCode/simplr-gulp.git`
2. `cd simplr-gulp/example`
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
            "[app/**/*]"
        ]
    },
    "WebConfig": null,
    "CfgVersion": 2.02
}
```
> [More info about configuration](https://github.com/QuatroCode/simplr-gulp/wiki/Configuration)

## Development
#### Prerequisites
You need global npm packages ([`gulp`](https://github.com/gulpjs/gulp-cli), [`typings`](https://github.com/typings/registry), [`jspm`](https://github.com/jspm/jspm-cli), [`rollup`](https://github.com/rollup/rollup)):

1. `npm install gulp-cli -g`
2. `npm install typings -g`
3. `npm install jspm -g`
4. `npm install rollup -g`

#### If you want to update `simplr-gulp` package yourself
1. `git clone https://github.com/QuatroCode/simplr-gulp.git`
2. `cd simplr-gulp`
3. `npm install`
3. `typings install`
4. `builder.bat -watch:sample`
5. Make changes

#### builder.bat available commands
```cmd
builder.bat -build	            # build code to /dist
builder.bat -build:sample	    # build code to /example
builder.bat -watch	            # build and start watcher to /dist
builder.bat -watch:sample	    # build and start watcher to /example
```
## License
[AGPL-3.0](LICENSE)

## Hyperlinks
* [simplr-gulp wiki](https://github.com/QuatroCode/simplr-gulp/wiki)
* [TypeScript](https://github.com/Microsoft/TypeScript)
* [Gulp](https://github.com/gulpjs/gulp)
* [Typings](https://github.com/typings/registry)
* [jspm](https://github.com/jspm/jspm-cli)
* [rollup](https://github.com/rollup/rollup)
* [TsLint](https://github.com/palantir/tslint)
* [NodeJS](https://nodejs.org)
