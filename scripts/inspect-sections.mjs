import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

function showSection(name, startPattern, endPattern) {
  const startIdx = html.indexOf(startPattern);
  if (startIdx === -1) {
    console.log(`=== ${name} NOT FOUND ===`);
    return;
  }
  const endIdx = endPattern ? html.indexOf(endPattern, startIdx) : startIdx + 800;
  console.log(`=== ${name} ===`);
  console.log(html.slice(startIdx, endIdx !== -1 ? endIdx + endPattern.length : startIdx + 800));
}

// 1. Steps
showSection("STEPS CSS", ".steps {", "}");
showSection("STEPS HTML", '<div class="steps"', '</div>');

// 2. Agent cards
showSection("AGENT CARDS HTML", 'id="agentSelectionList"', '</div>');

// 3. Phase 4 container
showSection("PHASE 4 HTML", 'id="phase4Wrapper"', '>');

// 4. Approve Panel
showSection("APPROVE PANEL", 'id="approvePanel"', '</form>');
