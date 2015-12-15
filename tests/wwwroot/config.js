System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "typescript",
  paths: {
    "github:*": "libs/github/*",
    "npm:*": "libs/npm/*",
    "quatrodev:*": "libs/quatrodev/*",
    "quatrodev-insider:*": "libs/quatrodev-insider/*"
  },
  buildCSS: false,

  map: {
    "css": "github:systemjs/plugin-css@0.1.20",
    "typescript": "npm:typescript@1.7.3"
  }
});
