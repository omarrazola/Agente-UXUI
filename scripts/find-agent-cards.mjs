import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.includes("Analista de") || l.includes("Agente de con") || l.includes("Revisor QA")) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
