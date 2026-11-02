import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const idx = html.indexOf("4. Prototipo y Entregables");
console.log("Found at:", idx);
console.log(html.slice(idx - 200, idx + 2500));
