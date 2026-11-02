import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.includes("updateApiIndicatorUI")) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
