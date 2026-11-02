import fs from "fs";

function updateFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");

  const targetRegex = /<div class="run"[\s\S]*?<\/button>\s*<div style="display:flex; justify-content:center; align-items:center; gap:16px;">\s*<button type="button" class="btn sm" id="skipBtn"[\s\S]*?<\/div>\s*<\/div>/;

  const replacement = `<div class="run" style="padding: 14px 20px 18px; display:flex; flex-direction:column; align-items:center; gap:10px; background:var(--surface);">
        <button class="btn primary" id="runBtn" title="Inicia el diseño interactivo con los agentes" style="padding:9px 24px; font-size:13.5px; border-radius:9999px; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-weight:700; width:auto; min-height:38px;">
          <span style="font-size:11px;line-height:1">▶</span>
          <span>Generar diseño interactivo con IA</span>
        </button>
        <div style="display:flex; justify-content:center; align-items:center;">
          <button type="button" class="btn sm" id="skipBtn" style="border:none; background:transparent; color:var(--muted); font-size:12px; text-decoration:underline; cursor:pointer;" title="Carga el prototipo al instante sin esperar la simulación">
            ⚡ Cargar pantallas al instante (sin esperar simulación)
          </button>
        </div>
      </div>`;

  if (!targetRegex.test(html)) {
    console.error(`❌ Could not find target in ${filePath}`);
    process.exit(1);
  }

  html = html.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, html, "utf8");
  console.log(`✔ Successfully updated ${filePath}`);
}

updateFile("public/index.html");
updateFile("demo/index.html");
