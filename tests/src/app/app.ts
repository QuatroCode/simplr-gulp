import Test from "./test";
import './app.css!';

class App {
    constructor() {
        console.log("app.ts: App() class init");
        let test = new Test();
    }
}

new App();