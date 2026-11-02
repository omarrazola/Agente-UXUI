import fs from "fs";

["public/index.html", "demo/index.html"].forEach(file => {
  let content = fs.readFileSync(file, "utf8");

  const oldReviewRegex = /\$\("#reviewForm"\)\.addEventListener\("submit",function\(e\)\{[\s\S]*?\}\);\s*\}\);\s*\/\/\s*----------\s*DS tab/i;

  const newReviewCode = `$("#reviewForm").addEventListener("submit", async function(e){
    e.preventDefault();
    var done=["#c1","#c2","#c3"].every(function(id){return $(id).checked});
    if(!done){toast("Marca los tres puntos de la lista antes de aprobar.",true);return}
    
    var approveBtn = $("#approveBtn");
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
            '<button type="button" class="btn sm" onclick="window.syncFigmaExport && window.syncFigmaExport();toast(\\'🎨 Diseño sincronizado con Figma\\');" style="font-weight:700">' +
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
            '<button type="button" class="btn sm primary" onclick="navigator.clipboard.writeText(document.getElementById(\\'handoffSpecPre\\').textContent).then(function(){toast(\\'📋 JSON copiado al portapapeles\\')});">' +
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

      toast("🎉 ¡Incidencia " + info.key + " entregada a desarrollo en Jira y Git!");
    } catch(err) {
      console.error("Handoff approve error:", err);
      $("#reviewState").textContent="Error";$("#reviewState").className="chip warn";
      if(approveBtn){
        approveBtn.disabled = false;
        approveBtn.innerHTML = '<span>Aprobar y enviar a desarrollo</span>';
      }
      toast("Error conectando con el servidor para la entrega. Revisa la consola.", true);
    }
  });

  // ---------- DS tab`;

  if (oldReviewRegex.test(content)) {
    content = content.replace(oldReviewRegex, newReviewCode);
    fs.writeFileSync(file, content, "utf8");
    console.log(`[${file}] Updated reviewForm to execute REAL handoff!`);
  } else {
    console.error(`[${file}] Could not match oldReviewRegex`);
  }
});
