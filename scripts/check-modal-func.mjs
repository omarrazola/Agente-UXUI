import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

// Check openApiSettingsModal function
const fnIdx = html.indexOf("window.openApiSettingsModal");
console.log(html.slice(fnIdx, fnIdx + 1200));
