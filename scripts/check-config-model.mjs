import fs from "fs";

const cfg = fs.readFileSync("src/config.ts", "utf8");
console.log(cfg);
