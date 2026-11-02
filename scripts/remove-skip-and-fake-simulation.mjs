import fs from "fs";

function cleanFiles(filePath) {
  let html = fs.readFileSync(filePath, "utf8");

  // 1. Remove the skip link in Phase 1
  html = html.replace(
    /\s*<div style="display:flex; justify-content:center; align-items:center;">\s*<button type="button" class="btn sm" id="skipBtn"[\s\S]*?<\/button>\s*<\/div>/g,
    ""
  );

  // 2. Remove the skip button in empty state in Phase 3
  html = html.replace(
    /\s*<button type="button" class="btn" onclick="document\.getElementById\('skipBtn'\)\.click\(\)" style="padding:10px 20px">\s*⚡ Ver pantallas al instante\s*<\/button>/g,
    ""
  );

  // 3. Update the text in Phase 3 empty state from "Lanzar agentes ahora" to "Generar diseño ahora"
  html = html.replace(
    "▶ Lanzar agentes ahora",
    "▶ Generar diseño con IA"
  );

  // 4. Clean JS references to skipBtn
  html = html.replace(
    /\$\("#runBtn"\)\.disabled=true;\s*\$\("#skipBtn"\)\.disabled=false;/g,
    'var rB=$("#runBtn"); if(rB) rB.disabled=true;'
  );

  html = html.replace(
    /\$\("#skipBtn"\)\.disabled=false;/g,
    'var sB=$("#skipBtn"); if(sB) sB.disabled=false;'
  );

  html = html.replace(
    /\$\("#skipBtn"\)\.addEventListener\("click",\s*skip\);/g,
    'var sB2=$("#skipBtn"); if(sB2) sB2.addEventListener("click", skip);'
  );

  // 5. Replace any confusing wording "simulación" or "simulador" in user-facing texts
  html = html.replace(
    /title="Inicia el diseño interactivo con los agentes"/g,
    'title="Genera el diseño completo con el equipo de agentes de IA"'
  );

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`✔ Successfully cleaned ${filePath}`);
}

cleanFiles("public/index.html");
cleanFiles("demo/index.html");
