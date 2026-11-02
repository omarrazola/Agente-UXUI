import fs from "fs";

const serverTs = fs.readFileSync("src/server.ts", "utf8");
const start = serverTs.indexOf('app.post("/api/test-credentials"');
if (start !== -1) {
  console.log(serverTs.slice(start, start + 1200));
} else {
  console.log("/api/test-credentials not found!");
}
