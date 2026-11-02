import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

// 1. Check jiraSelect
const selectMatch = html.match(/<select[^>]*id="jiraSelect"[^>]*>([\s\S]*?)<\/select>/);
console.log("--- SELECT HTML ---");
console.log(selectMatch ? selectMatch[0].slice(0, 400) : "Not found");

// Check where jiraSelect options are populated in JS
const jsMatch = html.match(/jiraSelect\.innerHTML\s*=\s*`([\s\S]*?)`;/);
console.log("--- JS POPULATE ---");
console.log(jsMatch ? jsMatch[0].slice(0, 300) : "Not found");

// 2. Check steps markup and CSS
const stepsMatch = html.match(/<nav class="steps"[\s\S]*?<\/nav>/);
console.log("--- STEPS HTML ---");
console.log(stepsMatch ? stepsMatch[0] : "Not found");

// 3. Check agent cards in step 2
const agentsMatch = html.match(/<div class="agent-grid"[\s\S]*?<\/div>\s*<\/div>/);
console.log("--- AGENTS HTML ---");
console.log(agentsMatch ? agentsMatch[0].slice(0, 400) : "Not found");

// 4. Check approval panel
const approveMatch = html.match(/<div class="panel approve-panel"[\s\S]*?<\/form>\s*<\/div>/);
console.log("--- APPROVE HTML ---");
console.log(approveMatch ? approveMatch[0].slice(0, 600) : "Not found");
