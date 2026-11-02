import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const idx = html.indexOf("window.updateApiIndicatorUI = function");
console.log(html.slice(idx, idx + 1500));
