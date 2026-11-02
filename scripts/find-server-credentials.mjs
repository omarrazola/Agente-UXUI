import fs from "fs";

const serverTs = fs.readFileSync("src/server.ts", "utf8");
const lines = serverTs.split("\n");
lines.forEach((l, i) => {
  if (l.includes("userConfig") || l.includes("extractCredentials") || l.includes("/api/test-credentials") || l.includes("byok")) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
