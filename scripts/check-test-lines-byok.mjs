import fs from "fs";

const script = fs.readFileSync("scripts/test-ui-interactions.mjs", "utf8");
const lines = script.split("\n");
lines.forEach((l, i) => {
  if (l.includes("btnOpenByokConfig") || l.includes("apiSettingsModal")) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
