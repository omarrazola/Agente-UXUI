import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf('id="phase-4"');
const end = html.indexOf('<!-- ================= SISTEMA ================= -->');
console.log(html.slice(start, start + 3500));
