System.registerDynamic("github:systemjs/plugin-css@0.1.20/css", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  if (typeof window !== 'undefined') {
    var waitSeconds = 100;
    var head = document.getElementsByTagName('head')[0];
    var links = document.getElementsByTagName('link');
    var linkHrefs = [];
    for (var i = 0; i < links.length; i++) {
      linkHrefs.push(links[i].href);
    }
    var isWebkit = !!window.navigator.userAgent.match(/AppleWebKit\/([^ ;]*)/);
    var webkitLoadCheck = function(link, callback) {
      setTimeout(function() {
        for (var i = 0; i < document.styleSheets.length; i++) {
          var sheet = document.styleSheets[i];
          if (sheet.href == link.href)
            return callback();
        }
        webkitLoadCheck(link, callback);
      }, 10);
    };
    var noop = function() {};
    var loadCSS = function(url) {
      return new Promise(function(resolve, reject) {
        var timeout = setTimeout(function() {
          reject('Unable to load CSS');
        }, waitSeconds * 1000);
        var _callback = function(error) {
          clearTimeout(timeout);
          link.onload = link.onerror = noop;
          setTimeout(function() {
            if (error)
              reject(error);
            else
              resolve('');
          }, 7);
        };
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        if (!isWebkit) {
          link.onload = function() {
            _callback();
          };
        } else {
          webkitLoadCheck(link, _callback);
        }
        link.onerror = function(event) {
          _callback(event.error || new Error('Error loading CSS file.'));
        };
        head.appendChild(link);
      });
    };
    exports.fetch = function(load) {
      for (var i = 0; i < linkHrefs.length; i++)
        if (load.address == linkHrefs[i])
          return '';
      return loadCSS(load.address);
    };
  } else {
    function getBuilder(loader) {
      return loader['import']('./css-builder' + (System.version ? '.js' : ''), {name: module.id});
    }
    exports.cssPlugin = true;
    exports.fetch = function(load) {
      if (this.buildCSS === false)
        load.metadata.build = false;
      load.metadata.format = 'defined';
      return '';
    };
    exports.instantiate = function() {};
    exports.bundle = function(loads, opts) {
      var loader = this;
      if (loader.buildCSS === false)
        return '';
      return getBuilder(loader).then(function(builder) {
        return builder.bundle.call(loader, loads, opts);
      });
    };
    exports.listAssets = function(loads, compileOpts, outputOpts) {
      var loader = this;
      return getBuilder(loader).then(function(builder) {
        return builder.listAssets.call(loader, loads, compileOpts, outputOpts);
      });
    };
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:systemjs/plugin-css@0.1.20", ["github:systemjs/plugin-css@0.1.20/css"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('github:systemjs/plugin-css@0.1.20/css');
  global.define = __define;
  return module.exports;
});

System.register("wwwroot/app/app.css!github:systemjs/plugin-css@0.1.20", [], function() { return { setters: [], execute: function() {} } });

System.registerDynamic("wwwroot/app/app.js", ["wwwroot/app/app.css!github:systemjs/plugin-css@0.1.20"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('wwwroot/app/app.css!github:systemjs/plugin-css@0.1.20');
  var TestClass = (function() {
    function TestClass() {
      console.log("ZZ");
    }
    return TestClass;
  })();
  new TestClass();
  global.define = __define;
  return module.exports;
});
