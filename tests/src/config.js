System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "typescript",
  paths: {
    "github:*": "wwwroot/libs/github/*",
    "npm:*": "wwwroot/libs/npm/*",
    "quatrodev:*": "wwwroot/libs/quatrodev/*",
    "quatrodev-insider:*": "wwwroot/libs/quatrodev-insider/*"
  },
  buildCSS: false,

  map: {
    "css": "github:systemjs/plugin-css@0.1.20",
    "typescript": "npm:typescript@1.7.3"
  }
});
