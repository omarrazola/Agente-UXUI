import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");
lines.forEach((l, i) => {
  if (l.includes("3. Diseño creado") || l.includes("prototypePanel") || l.includes("demo-viewer") || l.includes("phase4Wrapper")) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
