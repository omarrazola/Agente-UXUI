import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const pos = html.indexOf("function getBriefInfo");
console.log(html.substring(pos, pos + 800));
