import fs from "fs";

const script = fs.readFileSync("scripts/test-ui-interactions.mjs", "utf8");
const start = script.indexOf("const ELEMENTS = [");
console.log(script.slice(start, start + 800));
