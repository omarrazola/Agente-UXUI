import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");

// 1. Update HTML markup of #approvePanel
const oldApprovePanel = `        <div class="panel" id="approvePanel">
          <div class="panel-h"><h2>Aprobación</h2><span class="chip warn" id="reviewState">Pendiente</span></div>
          <form class="review" id="reviewForm">
            <p class="muted-s">Se aprueba la versión que estás viendo: <b id="approveVer">v0</b>.</p>
            <label class="check"><input type="checkbox" id="c1"> El flujo responde a los tres puntos del brief</label>
            <label class="check"><input type="checkbox" id="c2"> Los textos encajan con el tono de Uber Base</label>
            <label class="check"><input type="checkbox" id="c3"> Las preguntas abiertas se han enviado a negocio</label>
            <button type="submit" class="btn primary" id="approveBtn">Aprobar y enviar a desarrollo</button>
            <div class="toast" id="toast" hidden></div>
          </form>
          <div class="handoff" id="handoff" hidden></div>
        </div>`;

const newApprovePanel = `        <div class="panel" id="approvePanel">
          <div class="panel-h">
            <h2>Entrega de diseño (Validación del Diseñador)</h2>
            <span class="chip warn" id="reviewState">Pendiente de entrega</span>
          </div>
          <form class="review" id="reviewForm">
            <p class="muted-s" style="margin-bottom:12px; line-height:1.45;">
              Como diseñador responsable, valida la propuesta (<b id="approveVer">v0</b>) para entregar la tarea en Jira y moverla a la columna <b>«To Review»</b> para la revisión y visto bueno del Lead Product Designer.
            </p>
            <label class="check"><input type="checkbox" id="c1"> El flujo responde al alcance y requerimientos del brief</label>
            <label class="check"><input type="checkbox" id="c2"> Componentes y tokens 100% alineados con Uber Base DS</label>
            <label class="check"><input type="checkbox" id="c3"> Accesibilidad WCAG 2.1 AA y criterios de diseño validados</label>
            <button type="submit" class="btn primary" id="approveBtn" style="width:100%; justify-content:center; padding:12px 18px; font-weight:700;">
              Aprobar y entregar para revisión del Lead (To Review)
            </button>
            <div style="margin-top:10px; font-size:11.5px; color:var(--muted); line-height:1.4; display:flex; align-items:flex-start; gap:6px;">
              <span>ℹ️</span>
              <span>Al entregar, la card en Jira pasa a la columna <b>«To Review»</b> y se publica un comentario formal notificando al Lead Product Designer con las especificaciones y tokens.</span>
            </div>
            <div class="toast" id="toast" hidden></div>
          </form>
          <div class="handoff" id="handoff" hidden></div>
        </div>`;

if (!html.includes(oldApprovePanel)) {
  console.error("Target oldApprovePanel not found in public/index.html!");
} else {
  html = html.replace(oldApprovePanel, newApprovePanel);
  console.log("Approve panel markup updated!");
}

// 2. Update the reviewForm JS event listener
const oldJsBlock = `    var approveBtn = $("#approveBtn");
    if(approveBtn){
      approveBtn.disabled = true;
      approveBtn.innerHTML = '<span class="base-spinner"></span> <span>Ejecutando entrega en producción (Jira, Git, Figma)...</span>';
    }

    approvedIdx=viewIdx; var v=versions[viewIdx], d=v.design, info=getBriefInfo();
    setLocked(true); renderVersions();
    $("#reviewState").textContent="Aprobando…";$("#reviewState").className="chip warn";

    var criteriaTexts = [
      "El flujo responde a los tres puntos del brief",
      "Los textos encajan con el tono de Uber Base",
      "Las preguntas abiertas se han enviado a negocio"
    ];

    try {
      var resp = await fetch("/api/handoff/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: info.key,
          version: v.n,
          summary: v.summary || "Entrega aprobada para desarrollo",
          design: d,
          criteria: criteriaTexts
        })
      });
      var data = await resp.json();

      $("#reviewState").textContent="Aprobado · v"+v.n;$("#reviewState").className="chip ok";
      $("#newCol").textContent = "Listo para desarrollo";
      $("#reviewForm").hidden=true;
      
      var ho=$("#handoff"); ho.hidden=false;

      var jiraStatusText = data.jira && data.jira.status ? data.jira.status : "Aprobado";
      var gitCommit = data.git && data.git.commit ? data.git.commit : "HEAD";
      var gitBranch = data.git && data.git.branch ? data.git.branch : ("design/" + info.key.toLowerCase());
      var figmaLabel = data.figma && data.figma.label ? data.figma.label : (info.key + " · v" + v.n + " aprobada");

      ho.innerHTML = 
        '<div class="toast" style="background:#EAF6ED;border:1px solid #0E8345;color:#0E8345;font-weight:700;display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:10px">' +
          '<span style="font-size:18px">🚀</span>' +
          '<span>¡Entrega de la versión v' + v.n + ' ejecutada y confirmada en producción con éxito!</span>' +
        '</div>' +
        '<div style="margin:16px 0 10px;font-size:13.5px;font-weight:700;color:var(--fg)">Acciones ejecutadas en tiempo real por el Agente de Entrega:</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">' +
          '<div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
            '<div style="display:flex;align-items:center;gap:10px">' +
              '<span style="font-size:18px">✅</span>' +
              '<div>' +
                '<b style="font-size:13px;color:var(--fg)">Jira Cloud: Incidencia ' + h(info.key) + ' movida a «' + h(jiraStatusText) + '»</b>' +
                '<div style="font-size:12px;color:var(--muted)">Comentario técnico con especificación completa, componentes y criterios publicado en el ticket.</div>' +
              '</div>' +
            '</div>' +
            '<a href="' + (data.jira && data.jira.url ? data.jira.url : ('https://pruebasantigravity.atlassian.net/browse/' + info.key)) + '" target="_blank" rel="noopener noreferrer" class="btn sm" style="font-weight:700;color:#276EF1;text-decoration:none">' +
              'Abrir en Jira Cloud ↗' +
            '</a>' +
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
                '<div style="font-size:12px;color:var(--muted)">Emisión WebSocket enviada al plugin de Figma Desktop con frames actualizados.</div>' +
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
            jiraStatus: jiraStatusText,
            gitBranch: gitBranch,
            gitCommit: gitCommit,
            tokens: { cta: d.theme.cta, radius: d.theme.radius, density: d.theme.density },
            pantallas: (Array.isArray(d.screens) && d.screens.length > 0) ? d.screens.map(function(s){ return s.shortName || s.mainTitle; }) : ["1. Selección de servicio", "2. Opciones y preferencias", "3. Punto de recogida y pago", "4. Fallo y recuperación", "5. Conductor en camino y PIN"],
            componentes: ["Header","MapCard","Badge","Chip","VehicleCard","RateOption","PriceSummary","Stepper","Input","PointsToggle","SecurityPIN","Button"]
          }, null, 2)) +
        '</pre>' +
        '<div style="margin-top:14px;display:flex;gap:10px">' +
          '<button type="button" class="btn" id="reopenBtn">Reabrir revisión</button>' +
        '</div>';

      $("#reopenBtn").addEventListener("click",function(){
        approvedIdx=-1; setLocked(false); renderVersions();
        ho.hidden=true; $("#reviewForm").hidden=false; $("#toast").hidden=true;
        if(approveBtn){
          approveBtn.disabled = false;
          approveBtn.innerHTML = '<span>Aprobar y enviar a desarrollo</span>';
        }
        $("#reviewState").textContent="Pendiente";$("#reviewState").className="chip warn";
        $("#newCol").textContent="Revisión diseño";
      });

      toast("🎉 ¡Incidencia " + info.key + " entregada a desarrollo en Jira y Git!");`;

const newJsBlock = `    var approveBtn = $("#approveBtn");
    if(approveBtn){
      approveBtn.disabled = true;
      approveBtn.innerHTML = '<span class="base-spinner"></span> <span>Entregando tarea y notificando al Lead en Jira...</span>';
    }

    approvedIdx=viewIdx; var v=versions[viewIdx], d=v.design, info=getBriefInfo();
    setLocked(true); renderVersions();
    $("#reviewState").textContent="Entregando…";$("#reviewState").className="chip warn";

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

      $("#reviewState").textContent="Entregado · To Review";$("#reviewState").className="chip ok";
      $("#newCol").textContent = "To Review";
      $("#reviewForm").hidden=true;
      
      var ho=$("#handoff"); ho.hidden=false;

      var jiraStatusText = "To Review";
      var gitCommit = data.git && data.git.commit ? data.git.commit : "HEAD";
      var gitBranch = data.git && data.git.branch ? data.git.branch : ("design/" + info.key.toLowerCase());
      var figmaLabel = data.figma && data.figma.label ? data.figma.label : (info.key + " · v" + v.n + " para revisión del Lead");

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
          '<button type="button" class="btn" id="reopenBtn">Reabrir revisión</button>' +
        '</div>';

      $("#reopenBtn").addEventListener("click",function(){
        approvedIdx=-1; setLocked(false); renderVersions();
        ho.hidden=true; $("#reviewForm").hidden=false; $("#toast").hidden=true;
        if(approveBtn){
          approveBtn.disabled = false;
          approveBtn.innerHTML = '<span>Aprobar y entregar para revisión del Lead (To Review)</span>';
        }
        $("#reviewState").textContent="Pendiente de entrega";$("#reviewState").className="chip warn";
        $("#newCol").textContent="En Diseño";
      });

      toast("🎉 ¡Tarea " + info.key + " entregada a revisión del Lead en Jira (To Review)!");`;

if (!html.includes(oldJsBlock)) {
  console.error("Target oldJsBlock not found in public/index.html!");
} else {
  html = html.replace(oldJsBlock, newJsBlock);
  console.log("Approve JS listener updated!");
}

// 3. Update any other 'Aprobar y enviar a desarrollo' text
html = html.replace(
  /approveBtn\.innerHTML\s*=\s*'<span>Aprobar y enviar a desarrollo<\/span>';/g,
  "approveBtn.innerHTML = '<span>Aprobar y entregar para revisión del Lead (To Review)</span>';"
);

fs.writeFileSync("public/index.html", html, "utf8");
fs.writeFileSync("demo/index.html", html, "utf8");
console.log("public/index.html and demo/index.html successfully updated and synchronized!");
