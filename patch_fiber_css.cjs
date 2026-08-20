const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newCSS = \

.red-pen-container-fiber {
  position: relative;
  width: 120px;
  height: 80px;
  pointer-events: none;
}
.red-pen-line-fiber {
  position: absolute;
  top: 0;
  left: 0;
  width: 45px;
  height: 1px;
  background-color: #dc2626;
  transform: rotate(30deg);
  transform-origin: top left;
}
.red-pen-text-fiber {
  position: absolute;
  top: 20px; 
  left: 35px;
  font-family: 'Caveat', cursive;
  color: #dc2626;
  font-size: 0.85rem;
  line-height: 1.0;
  transform: rotate(-10deg);
  white-space: nowrap;
  text-shadow: 1px 1px 0px rgba(255,255,255,1), 
               -1px -1px 0px rgba(255,255,255,1),
               1px -1px 0px rgba(255,255,255,1),
               -1px 1px 0px rgba(255,255,255,1);
}
\;

css += newCSS;
fs.writeFileSync('src/index.css', css);
