import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const idx = html.indexOf('<div class="after">');
console.log(html.slice(idx, idx + 2500));
