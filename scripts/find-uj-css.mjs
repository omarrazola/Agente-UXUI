import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.includes("user-journey-stepper") || l.includes("uj-step") || l.includes("uj-content")) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
