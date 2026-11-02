import fs from "fs";

function updateDropdownWidth(filePath) {
  let html = fs.readFileSync(filePath, "utf8");

  // Old wrapper and select pattern
  const oldChunk = `<div style="display:inline-flex; align-items:center; gap:8px; flex:1; min-width:300px;">
            <label for="jiraSelect" style="color:var(--fg);font-weight:700;font-size:13px;white-space:nowrap">
              <span style="margin-right:4px">🏷️</span> Incidencia Jira (Proyecto KAN):
            </label>
            <select id="jiraSelect" style="flex:1; padding:9px 12px; border-radius:8px; border:1px solid var(--line); background:var(--sunken); color:var(--fg); font-size:13px; font-weight:600; cursor:pointer;">
              <option value="">Elige la tarea</option>
            </select>`;

  const newChunk = `<div style="display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; max-width:100%;">
            <label for="jiraSelect" style="color:var(--fg);font-weight:700;font-size:13px;white-space:nowrap">
              <span style="margin-right:4px">🏷️</span> Incidencia Jira (Proyecto KAN):
            </label>
            <select id="jiraSelect" style="width: 320px; max-width: 100%; padding:9px 12px; border-radius:8px; border:1px solid var(--line); background:var(--sunken); color:var(--fg); font-size:13px; font-weight:600; cursor:pointer;">
              <option value="">Elige la tarea</option>
            </select>`;

  if (html.includes(oldChunk)) {
    html = html.replace(oldChunk, newChunk);
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`Updated dropdown width in ${filePath}`);
  } else {
    // Try with normalized line endings
    const oldNormalized = oldChunk.replace(/\r?\n/g, "\n");
    const htmlNormalized = html.replace(/\r?\n/g, "\n");
    if (htmlNormalized.includes(oldNormalized)) {
      const isCRLF = html.includes("\r\n");
      const rep = newChunk.replace(/\r?\n/g, isCRLF ? "\r\n" : "\n");
      const target = oldChunk.replace(/\r?\n/g, isCRLF ? "\r\n" : "\n");
      html = html.replace(target, rep);
      fs.writeFileSync(filePath, html, "utf8");
      console.log(`Updated dropdown width (normalized) in ${filePath}`);
    } else {
      console.error(`Target chunk not found in ${filePath}`);
    }
  }
}

updateDropdownWidth("public/index.html");
updateDropdownWidth("demo/index.html");
