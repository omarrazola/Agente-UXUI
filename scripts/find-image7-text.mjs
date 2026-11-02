import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.toLowerCase().includes("en producción, el agente") || l.includes("Listo para desarrollo") || l.includes("haría esto automáticamente")) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
