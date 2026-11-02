import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const fnIdx = html.indexOf("window.testApiIntegration = async function");
console.log(html.slice(fnIdx + 1200, fnIdx + 2600));
