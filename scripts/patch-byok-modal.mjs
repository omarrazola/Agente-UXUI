import fs from "fs";

function patchByok(filePath) {
  let html = fs.readFileSync(filePath, "utf8");

  // 1. Update button in byokBanner
  html = html.replace(
    `<button type="button" class="btn sm" onclick="window.openApiSettingsModal()" style="background:#000000;color:#FFFFFF;border-radius:9999px;font-size:12px;padding:4px 12px;font-weight:700;white-space:nowrap;cursor:pointer">Configurar ↗</button>`,
    `<button type="button" class="btn sm" id="btnOpenByokConfig" onclick="window.openApiSettingsModal && window.openApiSettingsModal()" style="background:#000000;color:#FFFFFF;border-radius:9999px;font-size:12px;padding:4px 12px;font-weight:700;white-space:nowrap;cursor:pointer">Configurar ↗</button>`
  );

  // 2. Update select options for Gemini models
  const oldGeminiSelect = `<select id="byokGeminiModel" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font-size:12px">
              <option value="gemini-3.8-flash" selected>gemini-3.8-flash (Recomendado)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            </select>`;

  const newGeminiSelect = `<select id="byokGeminiModel" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font-size:12px">
              <option value="gemini-2.5-flash" selected>gemini-2.5-flash (Recomendado)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
            </select>`;

  html = html.replace(oldGeminiSelect, newGeminiSelect);

  // 3. Update default model in JS
  html = html.replace(/gemini-3\.8-flash/g, "gemini-2.5-flash");

  // 4. Attach explicit event listener for byokBtn
  const oldInitEnd = `  // Ejecutar verificación inicial al cargar la página
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", window.updateApiIndicatorUI);
  } else {
    setTimeout(window.updateApiIndicatorUI, 100);
  }`;

  const newInitEnd = `  // Adjuntar listeners directos al botón de configuración
  document.addEventListener("DOMContentLoaded", function(){
    var btn = document.getElementById("btnOpenByokConfig");
    if(btn){
      btn.addEventListener("click", function(e){
        e.preventDefault();
        if(typeof window.openApiSettingsModal === "function") window.openApiSettingsModal();
      });
    }
  });

  // Ejecutar verificación inicial al cargar la página
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", window.updateApiIndicatorUI);
  } else {
    setTimeout(window.updateApiIndicatorUI, 100);
  }`;

  html = html.replace(oldInitEnd, newInitEnd);

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`Patched ${filePath}`);
}

patchByok("public/index.html");
patchByok("demo/index.html");
