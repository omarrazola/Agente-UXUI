import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf('id="approvePanel"');
console.log(html.slice(start - 50, start + 600));
