# simplr-gulp

### I just want to use gulpfile.js
Simply copy [dist/gulpfile.js](https://github.com/QuatroCode/simplr-gulp/blob/master/dist/gulpfile.js) to your project and run task:
```
gulp
```
Which will run `gulp default` task and start watching your files (`*.ts`, `*.scss`, `index.html`, `configs`, etc.) and compiling them from source to build directory. Also it starts server tailored for Single Page Application.

All directories, server and live-reload settings are configured in `gulpconfig.json`.

After first run, `gulpconfig.json` file will be generated for you to edit for your own use.

### Available commands
#### Gulp tasks
* `Build` - compiles source files with development enviroment
    * `Build.Assets` - copies all `assets` folders and their contents from source to build directory
    * `Build.Configs` - copies `web.config` (for Asp.Net 5 projects) and `configs` folder from source to build directory
    * `Build.Html` - copies all `*.html` files from source to build directory
    * `Build.Scripts` - compiles TypeScript with sourcemap from source to build directory
    * `Build.Styles` - compiles `*.scss` files from source to build directory

* `Build:Production` - compiles, minifies and uglifies source files with production enviroment
    * `Build.Assets:Production` - copies all `assets` folders and their contents from source to build directory
    * `Build.Configs:Production` - copies `web.config` (for Asp.Net 5 projects) and `configs` folder from source to build directory
    * `Build.Html:Production` - copies all `*.html` files from source to build directory
    * `Build.Scripts:Production` - compiles TypeScript from source to build directory
    * `Build.Styles:Production` - compiles and minifies `*.scss` files from source to build directory


* `Watch` - watch source files and start tasks. 
    * `Watch.Assets` - start task `Build.Assets`
    * `Watch.Configs` - start task `Build.Configs`
    * `Watch.Html` - start task `Build.Html`
    * `Watch.Scripts` - start task `Build.Script`
    * `Watch.Styles` - start task `Build.Styles`
> **`Watch.*` subtasks available only at runtime.**

#### Coming soon Gulp tasks
* `Bundle` - bundles the app with `jspm bundle` with development enviroment
* `Bundle:Production` - bundles the app with `jspm bundle` with production enviroment

* `Clean` - cleans build directory (`wwwroot` by default) without `wwwroot/libs` folder
    * `Clean.All` - cleans build directory (`wwwroot` by default)

## Prerequisites
You need global npm packages ([`gulp`](https://github.com/gulpjs/gulp), [`typings`](https://github.com/typings/registry), [`jspm`](https://github.com/jspm/jspm-cli))):

1. `npm install gulp -g`
2. `npm install typings -g`
3. `npm install jspm -g`

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
#### If you want to update gulpfile.ts yourself
1. `git clone https://github.com/QuatroCode/simplr-gulp.git`
2. `cd simplr-gulp`
3. `npm install`
3. `typings install`
4. `builder.bat -watch:sample`
5. Make changes

#### builder.bat available commands 
    `builder.bat -build	            # build code to /dist` 
    `builder.bat -build:sample	    # build code to /example`
    `builder.bat -watch	            # build and start watcher to /dist`
    `builder.bat -watch:sample	    # build and start watcher to /example`

## Hyperlinks
* [simplr-gulp wiki](https://github.com/QuatroCode/simplr-gulp/wiki)
* [gulp](https://github.com/gulpjs/gulp)
* [typings](https://github.com/typings/registry)
* [jspm](https://github.com/jspm/jspm-cli)
