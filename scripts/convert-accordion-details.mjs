import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");

// 1. Replace the accordion container with <details id="advBriefAccordion"> and <summary id="advBriefToggle">
const oldAccordionStart = `      <!-- Acordeón Desplegable: Opciones Avanzadas Técnicas (Jira, Trello, Metadatos) -->
      <div class="advanced-brief-accordion" style="border-top: 1px solid var(--line); background: var(--sunken); border-radius: 0 0 var(--r) var(--r); overflow: hidden;">
        <button type="button" id="advBriefToggle" class="adv-toggle-btn" aria-expanded="false" onclick="window.toggleAdvBrief && window.toggleAdvBrief(event)" style="width:100%; padding:12px 20px; border:none; background:transparent; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-size:12.5px; color:var(--muted); font-weight:600; font-family:var(--f-ui);">
          <span style="display:inline-flex;align-items:center;gap:6px">⚙️ Opciones avanzadas (Jira, Trello, Prioridad y Clave de Ticket)</span>
          <span id="advChevron" style="font-size:11px; transition:transform .2s ease;">▾</span>
        </button>
        
        <div id="advBriefBody" hidden style="padding:14px 20px 20px; border-top: 1px dashed var(--line); display:flex; flex-direction:column; gap:12px;">`;

const newAccordionStart = `      <!-- Acordeón Desplegable: Opciones Avanzadas Técnicas (Nativo HTML5 <details>) -->
      <details class="advanced-brief-accordion" id="advBriefAccordion" style="border-top: 1px solid var(--line); background: var(--sunken); border-radius: 0 0 var(--r) var(--r); overflow: hidden;">
        <summary id="advBriefToggle" style="width:100%; padding:13px 20px; border:none; background:transparent; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-size:13px; color:var(--fg); font-weight:700; font-family:var(--f-ui); list-style:none; user-select:none; transition:background .15s ease;">
          <span style="display:inline-flex;align-items:center;gap:8px"><span>⚙️</span> Opciones avanzadas (Jira, Trello, Prioridad y Clave de Ticket)</span>
          <span id="advChevron" style="font-size:11.5px; color:var(--muted); font-weight:600; padding:3px 12px; border-radius:9999px; background:var(--surface); border:1px solid var(--line); transition:all .2s ease;">Desplegar ▾</span>
        </summary>
        
        <div id="advBriefBody" style="padding:16px 20px 20px; border-top: 1px dashed var(--line); display:flex; flex-direction:column; gap:12px; background:var(--surface);">`;

// Replace closing tag
const oldAccordionEnd = `          <p class="trigger-note" id="triggerNote" style="margin:0; font-size:12px; color:var(--muted)">En producción esto se dispara automáticamente: al crear la incidencia en Jira con la etiqueta <span class="mono">diseño</span>, el orquestador recibe el webhook.</p>
        </div>
      </div>
    </div>`;

const newAccordionEnd = `          <p class="trigger-note" id="triggerNote" style="margin:0; font-size:12px; color:var(--muted)">En producción esto se dispara automáticamente: al crear la incidencia en Jira con la etiqueta <span class="mono">diseño</span>, el orquestador recibe el webhook.</p>
        </div>
      </details>
    </div>`;

// Regex replace for CRLF resilience
const regexStart = /<!-- Acordeón Desplegable: Opciones Avanzadas Técnicas[\s\S]*?<div id="advBriefBody"[\s\S]*?gap:12px;">/;
const regexEnd = /<p class="trigger-note" id="triggerNote"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Pipeline/;

if (!regexStart.test(html) || !regexEnd.test(html)) {
  console.error("❌ Could not match accordion blocks");
  process.exit(1);
}

html = html.replace(regexStart, newAccordionStart);
html = html.replace(regexEnd, newAccordionEnd + `\n\n    <!-- Pipeline`);

// 2. Add CSS styles for <details>
const cssExtra = `
details.advanced-brief-accordion summary::-webkit-details-marker { display: none !important; }
details.advanced-brief-accordion summary { list-style: none !important; outline: none; }
details.advanced-brief-accordion summary:hover { background: color-mix(in srgb, var(--brand-pink) 10%, var(--sunken)) !important; }
details.advanced-brief-accordion[open] summary { border-bottom: 1px solid var(--line); }
details.advanced-brief-accordion[open] #advChevron { background: #000000 !important; color: #FFFFFF !important; border-color: #000000 !important; }
:root[data-theme="dark"] details.advanced-brief-accordion[open] #advChevron { background: #FFFFFF !important; color: #000000 !important; border-color: #FFFFFF !important; }
`;

html = html.replace("</style>", cssExtra + "\n</style>");

// 3. Update JS handler for toggle
const jsToggleUpdate = `
  // ---------- Sincronización Amigable de Briefing y Acordeón Avanzado ----------
  var fTitle = $("#friendlyTitleInput");
  var fDesc = $("#friendlyDescInput");
  var tTitleEl = $("#tTitle");
  var tBodyEl = $("#tBody");
  var advAccordion = $("#advBriefAccordion");
  var advChevron = $("#advChevron");

  if (advAccordion) {
    advAccordion.addEventListener("toggle", function() {
      if (advChevron) {
        advChevron.textContent = advAccordion.open ? "Cerrar ▴" : "Desplegar ▾";
      }
    });
  }

  window.toggleAdvBrief = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (advAccordion) {
      advAccordion.open = !advAccordion.open;
    }
  };
`;

const jsOldBlock = /\/\/ ---------- Sincronización Amigable de Briefing y Acordeón Avanzado ----------[\s\S]*?if \(advToggle\) \{\s*advToggle\.addEventListener\("click", window\.toggleAdvBrief\);\s*\}/;

if (!jsOldBlock.test(html)) {
  console.error("❌ Could not match jsOldBlock");
  process.exit(1);
}

html = html.replace(jsOldBlock, jsToggleUpdate);

fs.writeFileSync("public/index.html", html, "utf8");
fs.writeFileSync("demo/index.html", html, "utf8");
console.log("✔ <details> refactoring successfully written to public/index.html and demo/index.html!");
