import fs from "fs";

const serverTs = fs.readFileSync("src/server.ts", "utf8");
const idx = serverTs.indexOf('app.post("/api/config/test"');
if (idx !== -1) {
  console.log("Found /api/config/test in server.ts:\n", serverTs.slice(idx, idx + 1000));
} else {
  console.log("NOT FOUND in server.ts!");
}
