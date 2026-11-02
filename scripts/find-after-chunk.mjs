import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");
const startIdx = html.indexOf('<div class="after">');
const endMarker = '<!-- ================= SISTEMA ================= -->';
const endIdx = html.indexOf(endMarker);
const chunk = html.slice(startIdx, endIdx);
console.log("CHUNKS:\n", chunk);
