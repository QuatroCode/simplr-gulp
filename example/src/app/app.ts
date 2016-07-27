import './styles/test.css!';

class Test {
 constructor() {
  document.getElementById("app-root").innerHTML = "Loaded";
  console.log("Loaded");
 }
}

new Test();