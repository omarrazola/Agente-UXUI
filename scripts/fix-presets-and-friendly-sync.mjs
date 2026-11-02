import fs from "fs";

function patchPreset(filePath) {
  let html = fs.readFileSync(filePath, "utf8");

  // 1. Add inline onclick to .b-pre buttons
  const oldPresetsBlock = `<div class="brief-presets" id="briefPresets" style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="b-pre active" data-preset="map" title="Seguimiento de conductor en mapa (KAN-1)">
            <span>📍</span> Seguimiento en Mapa
          </button>
          <button type="button" class="b-pre" data-preset="uber" title="Reserva de viaje con UberX y Comfort (UBER-104)">
            <span>🚗</span> Reserva de Viaje
          </button>
          <button type="button" class="b-pre" data-preset="ev" title="Recarga de vehículos eléctricos (EV-204)">
            <span>⚡</span> Recarga Eléctrica
          </button>
          <button type="button" class="b-pre" data-preset="airport" title="Recogida en aeropuerto y fallos de pago (UBER-894)">
            <span>✈️</span> Aeropuerto & Incidencias
          </button>
          <button type="button" class="b-pre" data-preset="blank" title="Escribir una petición personalizada">
            <span>✏️</span> Escribir mi propia idea
          </button>
        </div>`;

  const newPresetsBlock = `<div class="brief-presets" id="briefPresets" style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="b-pre active" data-preset="map" onclick="window.applyPreset('map')" title="Seguimiento de conductor en mapa (KAN-1)" style="cursor:pointer">
            <span>📍</span> Seguimiento en Mapa
          </button>
          <button type="button" class="b-pre" data-preset="uber" onclick="window.applyPreset('uber')" title="Reserva de viaje con UberX y Comfort (UBER-104)" style="cursor:pointer">
            <span>🚗</span> Reserva de Viaje
          </button>
          <button type="button" class="b-pre" data-preset="ev" onclick="window.applyPreset('ev')" title="Recarga de vehículos eléctricos (EV-204)" style="cursor:pointer">
            <span>⚡</span> Recarga Eléctrica
          </button>
          <button type="button" class="b-pre" data-preset="airport" onclick="window.applyPreset('airport')" title="Recogida en aeropuerto y fallos de pago (UBER-894)" style="cursor:pointer">
            <span>✈️</span> Aeropuerto & Incidencias
          </button>
          <button type="button" class="b-pre" data-preset="blank" onclick="window.applyPreset('blank')" title="Escribir una petición personalizada" style="cursor:pointer">
            <span>✏️</span> Escribir mi propia idea
          </button>
        </div>`;

  const presetRegex = /<div class="brief-presets" id="briefPresets"[\s\S]*?<\/div>/;
  html = html.replace(presetRegex, newPresetsBlock);

  // 2. Overwrite applyPreset function with robust implementation
  const oldApplyRegex = /function applyPreset\(pKey\)\{[\s\S]*?\}\s*window\.applyPreset\s*=\s*applyPreset;/;

  const newApplyCode = `function applyPreset(pKey){
    var p = PRESETS[pKey];
    if(!p) return;

    // Actualizar ticket interno
    var tKey = $("#tKey"), tPri = $("#tPriority"), tTit = $("#tTitle"), tBod = $("#tBody"), tAtt = $("#tAttach"), tAut = $("#tAuthor");
    if(tKey) tKey.textContent = p.key;
    if(tPri) tPri.textContent = p.priority;
    if(tTit) tTit.textContent = p.title;
    if(tBod) tBod.innerHTML = p.body;
    if(tAtt) tAtt.innerHTML = p.attach;
    if(tAut) tAut.textContent = p.author;

    // ACTUALIZAR DIRECTAMENTE LAS CAJAS AMIGABLES VISIBLES
    var fTitleEl = document.getElementById("friendlyTitleInput");
    var fDescEl = document.getElementById("friendlyDescInput");
    if(fTitleEl) {
      fTitleEl.value = (pKey === "blank") ? "" : p.title;
      fTitleEl.style.transition = "background-color 0.25s ease";
      fTitleEl.style.backgroundColor = "var(--surface)";
      setTimeout(function(){ fTitleEl.style.backgroundColor = "var(--sunken)"; }, 300);
    }
    if(fDescEl) {
      if(pKey === "blank"){
        fDescEl.value = "";
      } else {
        var plain = p.body.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
        plain = plain.replace(/^Contexto\\.\\s*/i, "").replace(/Qué necesitamos\\.\\s*/i, "\\n\\n").trim();
        fDescEl.value = plain;
      }
      fDescEl.style.transition = "background-color 0.25s ease";
      fDescEl.style.backgroundColor = "var(--surface)";
      setTimeout(function(){ fDescEl.style.backgroundColor = "var(--sunken)"; }, 300);
    }

    // Toggle active state on pills
    $all(".b-pre").forEach(function(b){
      var isTarget = (b.dataset.preset === pKey);
      b.classList.toggle("active", isTarget);
      b.setAttribute("aria-pressed", String(isTarget));
    });

    saveCustomBrief();
    prepareAgentsForBrief();
    updateUserJourney(1);
    showQuickToast("Cargado ejemplo: " + p.title.slice(0, 36) + "…");
  }
  window.applyPreset = applyPreset;`;

  html = html.replace(oldApplyRegex, newApplyCode);

  fs.writeFileSync(filePath, html, "utf8");
  console.log("✔ Patched preset functionality in", filePath);
}

patchPreset("public/index.html");
patchPreset("demo/index.html");
