import fs from "fs";
import vm from "vm";

const html = fs.readFileSync("public/index.html", "utf8");

// Extract all <script> tags
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptIdx++;
  const src = match[1];
  if (!src.trim()) continue;
  try {
    new vm.Script(src, { filename: `script-${scriptIdx}.js` });
    console.log(`Script ${scriptIdx}: Syntax OK (${src.length} bytes)`);
  } catch (err) {
    console.error(`Script ${scriptIdx} SYNTAX ERROR:`, err.message);
  }
}
