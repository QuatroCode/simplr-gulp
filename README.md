# simplr-gulp

### I just want to use gulpfile.js
1) Install NPM dev-depenencies: 
```cmd
npm install colors connect-livereload express gulpjs/gulp#4.0 gulp-clean-css gulp-sass gulp-sourcemaps gulp-tslint gulp-typescript gulp-uglify jspm@beta rimraf tiny-lr tsconfig-lint typescript --save-dev
```
2) Copy [dist/gulpfile.js](https://github.com/QuatroCode/simplr-gulp/blob/master/dist/gulpfile.js) to your project and run task:
```
gulp
```
Which will run `gulp default` task and start watching your files (`*.ts`, `*.scss`, `index.html`, `configs`, etc.) and compiling them from source to build directory. Also it starts server tailored for Single Page Application.

All directories, server and live-reload settings are configured in `gulpconfig.json`.

After first run, `gulpconfig.json` file will be generated for you to edit for your own use.

### Available commands
#### Gulp tasks
* `Build` - compiles source files with development enviroment (starts all `Build.*` subtasks)
    * `Build.Assets` - copies all `assets` folders and their contents from source to build directory
    * `Build.Configs` - copies `web.config` (for Asp.Net 5 projects) and `configs` folder from source to build directory
    * `Build.Html` - copies all `*.html` files from source to build directory
    * `Build.Scripts` - compiles TypeScript with sourcemap from source to build directory
    * `Build.Styles` - compiles `*.scss` files from source to build directory

* `Build:Production` - compiles, minifies and uglifies source files with production enviroment (starts all `Build.*:Production` subtasks)
    * `Build.Assets:Production` - copies all `assets` folders and their contents from source to build directory
    * `Build.Configs:Production` - copies `web.config` (for Asp.Net 5 projects) and `configs` folder from source to build directory
    * `Build.Html:Production` - copies all `*.html` files from source to build directory
    * `Build.Scripts:Production` - compiles TypeScript from source to build directory
    * `Build.Styles:Production` - compiles and minifies `*.scss` files from source to build directory


* `Watch` - watch source files and start tasks.  (starts all `Watch.*` subtasks)
    * `Watch.Assets` - start task `Build.Assets`
    * `Watch.Configs` - start task `Build.Configs`
    * `Watch.Html` - start task `Build.Html`
    * `Watch.Scripts` - start task `Build.Script`
    * `Watch.Styles` - start task `Build.Styles`

> **`Watch.*` subtasks available only at runtime.**

* `Bundle` - bundles the app with `jspm bundle` with development enviroment

* `Server` - Start localhost server.

* `Clean` - cleans build directory (`wwwroot` by default) without `wwwroot/libs` folder
    * `Clean.All` - cleans build directory (`wwwroot` by default)
    * `Clean.Bundle` - remove build file (`build.js` by default) from build directory (`wwwroot` by default) 

## Prerequisites
You need global npm packages ([`gulp`](https://github.com/gulpjs/gulp-cli), [`typings`](https://github.com/typings/registry), [`jspm`](https://github.com/jspm/jspm-cli), [`rollup`](https://github.com/rollup/rollup)):

1. `npm install gulp-cli -g`
2. `npm install typings -g`
3. `npm install jspm -g`
4. `npm install rollup -g`

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
            "[wwwroot/js/app/**/*]"
        ]
    },
    "WebConfig": null,
    "CfgVersion": 2.02
}
```
> [More info about configuration](https://github.com/QuatroCode/simplr-gulp/wiki/Configuration)

## Development
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

## Hyperlinks
* [simplr-gulp wiki](https://github.com/QuatroCode/simplr-gulp/wiki)
* [TypeScript](https://github.com/Microsoft/TypeScript)
* [Gulp](https://github.com/gulpjs/gulp)
* [Typings](https://github.com/typings/registry)
* [jspm](https://github.com/jspm/jspm-cli)
* [rollup](https://github.com/rollup/rollup)
* [TsLint](https://github.com/palantir/tslint)
