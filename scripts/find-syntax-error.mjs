import fs from "fs";
import vm from "vm";

const html = fs.readFileSync("public/index.html", "utf8");

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptIdx++;
  if (scriptIdx === 2) {
    const src = match[1];
    // Find line in html where script 2 starts
    const upToScript = html.slice(0, match.index);
    const startLine = upToScript.split("\n").length;
    console.log(`Script 2 starts around line ${startLine}`);
    
    // Test line by line or find exact error
    try {
      new vm.Script(src);
    } catch (e) {
      console.log("Error details:", e.stack);
      // Let's find which line in src caused it
      const lines = src.split("\n");
      for (let i = 1; i <= lines.length; i++) {
        const sub = lines.slice(0, i).join("\n");
        try {
          new vm.Script(sub);
        } catch (subErr) {
          if (!subErr.message.includes("Unexpected end of input")) {
            console.log(`Error at script line ${i} (HTML line ${startLine + i - 1}):`, subErr.message);
            console.log(`Offending line: ${lines[i - 1]}`);
            break;
          }
        }
      }
    }
  }
}
