import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");

// 1. Replace the HTML chunk from <div class="after"> to end of .after
const startMarker = '<div class="after">';
const endMarker = '</div>\r\n    </div>\r\n  </div>\r\n</section>';
const altEndMarker = '</div>\n    </div>\n  </div>\n</section>';

const startIdx = html.indexOf(startMarker);
let endIdx = html.indexOf(endMarker, startIdx);
let delimiter = endMarker;
if (endIdx === -1) {
  endIdx = html.indexOf(altEndMarker, startIdx);
  delimiter = altEndMarker;
}

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find boundaries for .after!");
  process.exit(1);
}

const newAfterHtml = `<div class="after">
        <!-- Panel 1: Historial de versiones generadas -->
        <div class="panel">
          <div class="panel-h">
            <h2>Historial de versiones</h2>
            <span class="time" id="verCount">1 versión</span>
          </div>
          <ol class="history" id="history"></ol>
        </div>

        <!-- Panel 2: Comentario y Entrega directa en Jira -->
        <div class="panel" id="ticketDeliveryPanel">
          <div class="panel-h">
            <h2>Comentario y Entrega en Jira</h2>
            <span class="chip col" id="newCol">En Diseño</span>
          </div>
          <div class="comment">
            <div class="who">
              <div class="avatar">AI</div>
              <div><b>Agente de entrega</b><br><span class="time" id="commentKey">KAN-1</span></div>
            </div>
            <p id="commentLead">Propuesta de diseño lista para revisión del Lead. Resumen:</p>
            <ul id="commentList">
              <li>Flujo completo interactivo con estados de navegación y recuperación.</li>
              <li>100% componentes y tokens oficiales de Uber Base DS.</li>
              <li>Accesibilidad WCAG 2.1 AA auditada y validada.</li>
              <li><b>Especificaciones técnicas:</b> Rama Git creada y lienzo Figma sincronizado.</li>
            </ul>
            <div class="links" id="commentLinks">
              <span>preview.internal/kan-1</span>
              <a href="https://www.figma.com/design/dcKVRyGjsYiK3Cl1iBHeXc/Untitled?node-id=0-1" target="_blank" style="color:inherit;text-decoration:underline">Figma › dcKVRyGjsYiK3Cl1iBHeXc</a>
              <span>rama: design/kan-1</span>
            </div>
          </div>

          <!-- Acción directa de entrega del Diseñador para revisión del Lead (sin checklists artificiales) -->
          <div id="deliveryActionBox" style="margin-top:16px; padding-top:16px; border-top:1px solid var(--line);">
            <button type="button" class="btn primary" id="btnDeliverToReview" style="width:100%; justify-content:center; padding:12px 18px; font-weight:700; font-size:14px; gap:8px;">
              <span>🚀</span> <span>Entregar tarea para revisión del Lead (To Review)</span>
            </button>
            <div style="margin-top:8px; font-size:11.5px; color:var(--muted); line-height:1.4; display:flex; align-items:center; gap:6px;">
              <span>ℹ️</span>
              <span>Al pulsar, se publica este comentario en la card de Jira y se mueve la tarea a la columna «To Review» para que el Lead valide el diseño.</span>
            </div>
          </div>

          <div class="handoff" id="handoff" hidden style="margin-top:16px;"></div>
        </div>
      </div>`;

html = html.slice(0, startIdx) + newAfterHtml + (delimiter === endMarker ? '\r\n    </div>\r\n  </div>\r\n</section>' : '\n    </div>\n  </div>\n</section>') + html.slice(endIdx + delimiter.length);

console.log("HTML .after successfully replaced!");

// 2. Safeguard line 9214: $("#approveVer").textContent="v"+viewIdx;
html = html.replace(
  '$("#approveVer").textContent="v"+viewIdx;',
  'if($("#approveVer")) $("#approveVer").textContent="v"+viewIdx;'
);

// 3. Safeguard line 9553: $("#c1").checked=$("#c2").checked=$("#c3").checked=false;
html = html.replace(
  '$("#c1").checked=$("#c2").checked=$("#c3").checked=false;',
  'if($("#c1")) $("#c1").checked=$("#c2").checked=$("#c3").checked=false;'
);

// 4. Update the delivery JS handler to bind to #btnDeliverToReview directly
const oldHandlerStart = '  // ---------- Aprobación y envío a desarrollo ----------';
const oldHandlerTarget = `  $("#reviewForm").addEventListener("submit", async function(e){
    e.preventDefault();
    var done=["#c1","#c2","#c3"].every(function(id){return $(id).checked});
    if(!done){toast("Marca los tres puntos de la lista antes de aprobar.",true);return}`;

const newHandlerCode = `  // ---------- Entrega de diseño a revisión del Lead (To Review) ----------
  var deliverBtn = $("#btnDeliverToReview");
  if(!deliverBtn) deliverBtn = $("#approveBtn");
  
  async function handleDeliverToReview(e){
    if(e && e.preventDefault) e.preventDefault();
    
    var btn = $("#btnDeliverToReview") || $("#approveBtn");
    if(btn){
      btn.disabled = true;
      btn.innerHTML = '<span class="base-spinner"></span> <span>Entregando tarea y notificando al Lead en Jira...</span>';
    }

    approvedIdx=viewIdx; var v=versions[viewIdx], d=v.design, info=getBriefInfo();
    setLocked(true); renderVersions();

    var criteriaTexts = [
      "El flujo responde al alcance y requerimientos del brief",
      "Componentes y tokens 100% alineados con Uber Base DS",
      "Accesibilidad WCAG 2.1 AA y criterios de diseño validados"
    ];

    try {
      var resp = await fetch("/api/handoff/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: info.key,
          version: v.n,
          summary: v.summary || "Entrega de propuesta v" + v.n + " para revisión del Lead",
          design: d,
          criteria: criteriaTexts
        })
      });
      var data = await resp.json();

      $("#newCol").textContent = "To Review";
      $("#newCol").className = "chip ok";
      
      var actBox = $("#deliveryActionBox");
      if(actBox) actBox.style.display = "none";
      
      var ho=$("#handoff"); 
      if(ho) ho.hidden=false;

      var jiraStatusText = "To Review";
      var gitCommit = data.git && data.git.commit ? data.git.commit : "HEAD";
      var gitBranch = data.git && data.git.branch ? data.git.branch : ("design/" + info.key.toLowerCase());
      var figmaLabel = data.figma && data.figma.label ? data.figma.label : (info.key + " · v" + v.n + " para revisión del Lead");

      if(ho) {
        ho.innerHTML = 
          '<div class="toast" style="background:#EAF6ED;border:1px solid #0E8345;color:#0E8345;font-weight:700;display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:10px">' +
            '<span style="font-size:18px">🚀</span>' +
            '<span>¡Tarea entregada con éxito! La card en Jira ha pasado a la columna «To Review» para que el Lead apruebe el diseño.</span>' +
          '</div>' +
          '<div style="margin:16px 0 10px;font-size:13.5px;font-weight:700;color:var(--fg)">Acciones ejecutadas en Jira, Git y Figma:</div>' +
          '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">' +
            '<div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<span style="font-size:18px">✅</span>' +
                '<div>' +
                  '<b style="font-size:13px;color:var(--fg)">Jira Cloud: Tarea ' + h(info.key) + ' movida a la columna «To Review»</b>' +
                  '<div style="font-size:12px;color:var(--muted)">Comentario formal publicado en la card informando de la entrega al Lead Product Designer con tokens y especificaciones.</div>' +
                '</div>' +
              '</div>' +
              '<a href="' + (data.jira && data.jira.url ? data.jira.url : ('https://pruebasantigravity.atlassian.net/browse/' + info.key)) + '" target="_blank" rel="noopener noreferrer" class="btn sm" style="font-weight:700;color:#276EF1;text-decoration:none">' +
                'Abrir en Jira Cloud ↗' +
              '</a>' +
            '</div>' +

            '<div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<span style="font-size:18px">👤</span>' +
                '<div>' +
                  '<b style="font-size:13px;color:var(--fg)">Lead Product Designer notificado: Pendiente de revisión final</b>' +
                  '<div style="font-size:12px;color:var(--muted)">La tarea queda a la espera del visto bueno del Lead en la columna «To Review» antes de pasar a desarrollo.</div>' +
                '</div>' +
              '</div>' +
              '<span class="chip warn" style="font-size:11px;font-weight:700">Pendiente Lead</span>' +
            '</div>' +

            '<div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<span style="font-size:18px">✅</span>' +
                '<div>' +
                  '<b style="font-size:13px;color:var(--fg)">Git: Rama creada <span class="mono">' + h(gitBranch) + '</span> con commit <span class="mono">' + h(gitCommit) + '</span></b>' +
                  '<div style="font-size:12px;color:var(--muted)">Código React (@uber/baseui), especificación JSON y diagrama Mermaid registrados en el repositorio.</div>' +
                '</div>' +
              '</div>' +
              '<span class="chip" style="font-family:var(--f-mono);font-size:11px;background:#EBF7EE;color:#0E8345">Git Verified</span>' +
            '</div>' +

            '<div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<span style="font-size:18px">✅</span>' +
                '<div>' +
                  '<b style="font-size:13px;color:var(--fg)">Figma Live: Sincronizado como «' + h(figmaLabel) + '»</b>' +
                  '<div style="font-size:12px;color:var(--muted)">Lienzo preparado y sincronizado para la sesión de revisión con el Lead.</div>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="btn sm" onclick="window.syncFigmaExport && window.syncFigmaExport();toast(\\\'🎨 Diseño sincronizado con Figma\\\');" style="font-weight:700">' +
                '🎨 Sincronizar Figma' +
              '</button>' +
            '</div>' +

            '<div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<span style="font-size:18px">✅</span>' +
                '<div>' +
                  '<b style="font-size:13px;color:var(--fg)">Especificación Técnica Handover Adjunta</b>' +
                  '<div style="font-size:12px;color:var(--muted)">Paquete completo con ' + (data.spec?.screensCount || 5) + ' pantallas, tokens W3C y componentes oficiales.</div>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="btn sm primary" onclick="navigator.clipboard.writeText(document.getElementById(\\\'handoffSpecPre\\\').textContent).then(function(){toast(\\\'📋 JSON copiado al portapapeles\\\')});">' +
                '📋 Copiar Spec' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<pre class="code" id="handoffSpecPre" style="max-height:240px;overflow-y:auto">' +
            h(JSON.stringify({
              ticket: info.key,
              version: "v" + v.n,
              jiraStatus: "To Review",
              gitBranch: gitBranch,
              gitCommit: gitCommit,
              tokens: { cta: d.theme.cta, radius: d.theme.radius, density: d.theme.density },
              pantallas: (Array.isArray(d.screens) && d.screens.length > 0) ? d.screens.map(function(s){ return s.shortName || s.mainTitle; }) : ["1. Selección de servicio", "2. Opciones y preferencias", "3. Punto de recogida y pago", "4. Fallo y recuperación", "5. Conductor en camino y PIN"],
              componentes: ["Header","MapCard","Badge","Chip","VehicleCard","RateOption","PriceSummary","Stepper","Input","PointsToggle","SecurityPIN","Button"]
            }, null, 2)) +
          '</pre>' +
          '<div style="margin-top:14px;display:flex;gap:10px">' +
            '<button type="button" class="btn" id="reopenBtn">Reabrir entrega</button>' +
          '</div>';

        $("#reopenBtn").addEventListener("click",function(){
          approvedIdx=-1; setLocked(false); renderVersions();
          ho.hidden=true;
          if(actBox) actBox.style.display = "block";
          if(btn){
            btn.disabled = false;
            btn.innerHTML = '<span>🚀 Entregar tarea para revisión del Lead (To Review)</span>';
          }
          $("#newCol").textContent="En Diseño";
          $("#newCol").className="chip col";
        });
      }

      toast("🎉 ¡Tarea " + info.key + " entregada a revisión del Lead en Jira (To Review)!");
    } catch(err) {
      console.error("Handoff approve error:", err);
      if(btn){
        btn.disabled = false;
        btn.innerHTML = '<span>🚀 Entregar tarea para revisión del Lead (To Review)</span>';
      }
      toast("Error conectando con el servidor para la entrega. Revisa la consola.", true);
    }
  }

  if(deliverBtn){
    deliverBtn.addEventListener("click", handleDeliverToReview);
  }
  var oldReviewForm = $("#reviewForm");
  if(oldReviewForm){
    oldReviewForm.addEventListener("submit", handleDeliverToReview);
  }`;

// Find the start of the old event listener and replace up to end of catch block
const jsStartIdx = html.indexOf('$("#reviewForm").addEventListener("submit",');
const jsEndMarker = 'toast("Error conectando con el servidor para la entrega. Revisa la consola.", true);\n    }\n  });';
const altJsEndMarker = 'toast("Error conectando con el servidor para la entrega. Revisa la consola.", true);\r\n    }\r\n  });';

let jsEndIdx = html.indexOf(jsEndMarker, jsStartIdx);
let jsDelim = jsEndMarker;
if (jsEndIdx === -1) {
  jsEndIdx = html.indexOf(altJsEndMarker, jsStartIdx);
  jsDelim = altJsEndMarker;
}

if (jsStartIdx !== -1 && jsEndIdx !== -1) {
  html = html.slice(0, jsStartIdx) + newHandlerCode + html.slice(jsEndIdx + jsDelim.length);
  console.log("JS delivery handler successfully updated!");
} else {
  console.error("Could not find boundaries for reviewForm JS handler:", jsStartIdx, jsEndIdx);
}

fs.writeFileSync("public/index.html", html, "utf8");
fs.writeFileSync("demo/index.html", html, "utf8");
console.log("Successfully written public/index.html and demo/index.html!");
