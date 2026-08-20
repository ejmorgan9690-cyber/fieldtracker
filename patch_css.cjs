const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('.red-pen-container {\n  position: relative;\n  width: 150px;\n  height: 100px;\n  pointer-events: none;\n}', '.red-pen-container {\n  position: relative;\n  width: 120px;\n  height: 80px;\n  pointer-events: none;\n}');

css = css.replace('.red-pen-line {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 70px;\n  height: 1px;\n  background-color: #dc2626;\n  transform: rotate(-35deg);\n  transform-origin: bottom left;\n}', '.red-pen-line {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 45px;\n  height: 1px;\n  background-color: #dc2626;\n  transform: rotate(-30deg);\n  transform-origin: bottom left;\n}');

css = css.replace('.red-pen-text {\n  position: absolute;\n  bottom: 30px; \n  left: 45px;\n  font-family: \'Caveat\', cursive;\n  color: #dc2626;\n  font-size: 1.15rem;\n  line-height: 1.1;\n  transform: rotate(-15deg);\n  white-space: nowrap;', '.red-pen-text {\n  position: absolute;\n  bottom: 20px; \n  left: 35px;\n  font-family: \'Caveat\', cursive;\n  color: #dc2626;\n  font-size: 0.85rem;\n  line-height: 1.0;\n  transform: rotate(-10deg);\n  white-space: nowrap;');

fs.writeFileSync('src/index.css', css);
