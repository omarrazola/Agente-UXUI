import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.toLowerCase().includes("fase 4") || l.includes("Fase 4") || l.includes("Prototipo interactivo")) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
