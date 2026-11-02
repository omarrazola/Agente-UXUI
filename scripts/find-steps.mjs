import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.includes("1. Briefing") || l.includes("2. Agentes") || l.includes("step-nav") || l.includes("steps-container") || l.includes("step-indicator")) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
