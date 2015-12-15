# simplr-gulp

### I just want to use gulpfile.js
Simply copy [build/gulpfile.js](https://github.com/QuatroCode/simplr-gulp/blob/master/build/gulpfile.js) to your project and run command:
`gulp`

After first run, `gulpconfig.json` file will be generated for you to edit for your own use.

### Prerequisites
You need global npm scripts ([`gulp`](https://github.com/gulpjs/gulp), [`tsd`](https://github.com/DefinitelyTyped/tsd), [`jspm`](https://github.com/jspm/jspm-cli))):

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


## Development
#### If you want to update gulpfile.ts yourself
1. `git clone https://github.com/QuatroCode/simplr-gulp.git`
2. `cd simplr-gulp`
3. `npm install`
3. `tsd reinstall`
4. `npm run watch` (or `npm run build` for one time compilation)
5. Make changes
