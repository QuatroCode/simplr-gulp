var test_1 = require("./test");
require('./app.css!');
var App = (function () {
    function App() {
        console.log("app.ts: App() class init");
        var test = new test_1.default();
    }
    return App;
}());
new App();
