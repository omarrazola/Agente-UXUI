import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf('id="apiSettingsModal"');
const end = html.indexOf('</main>', start);
console.log(html.slice(start, end));
