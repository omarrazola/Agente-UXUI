import fs from "fs";

const script = fs.readFileSync("scripts/test-ui-interactions.mjs", "utf8");
console.log(script.slice(0, 1500));
