import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");

// 1. Locate the .after block
const oldAfterBlock = `      <div class="after">
        <div class="stack">
          <div class="panel">
            <div class="panel-h"><h2>Historial de versiones</h2><span class="time" id="verCount">1 versión</span></div>
            <ol class="history" id="history"></ol>
          </div>
          <div class="panel">
            <div class="panel-h"><h2>Comentario publicado en el ticket</h2><span class="chip col" id="newCol">Revisión diseño</span></div>
            <div class="comment">
              <div class="who"><div class="avatar">AI</div><div><b>Agente de entrega</b><br><span class="time" id="commentKey">KAN-1</span></div></div>
              <p id="commentLead">Primera propuesta lista para revisión. Resumen:</p>
              <ul id="commentList">
                <li>Flujo completo de producto: Happy Path, Casos de Error con recuperación y Corner Cases.</li>
                <li>100 % componentes y tokens de Uber Base DS.</li>
                <li>Accesibilidad AA superada en todos los estados.</li>
                <li><b>2 preguntas abiertas para negocio:</b> ¿se puede pagar parte con Uber Cash y parte con tarjeta? ¿El PIN es obligatorio para todos los trayectos nocturnos?</li>
              </ul>
              <div class="links" id="commentLinks"><span>preview.internal/kan-1</span><a href="https://www.figma.com/design/dcKVRyGjsYiK3Cl1iBHeXc/Untitled?node-id=0-1" target="_blank" style="color:inherit;text-decoration:underline">Figma › dcKVRyGjsYiK3Cl1iBHeXc</a><span>rama: design/kan-1</span></div>
            </div>
          </div>
        </div>
        <div class="panel" id="approvePanel">
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
        </div>
      </div>`;

// The new .after block completely eliminates #approvePanel, the "Aprobación" title, and the 3 checkboxes.
// Instead, it has 2 clean columns: Left = Historial de versiones, Right = Comentario y Entrega en Jira with direct CTA.
const newAfterBlock = `      <div class="after">
        <!-- Panel 1: Historial de versiones -->
        <div class="panel">
          <div class="panel-h">
            <h2>Historial de versiones</h2>
            <span class="time" id="verCount">1 versión</span>
          </div>
          <ol class="history" id="history"></ol>
        </div>

        <!-- Panel 2: Comentario y Entrega en Jira -->
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

          <!-- Acción directa de entrega: sin checklist artificial -->
          <div id="deliveryActionBox" style="margin-top:16px; padding-top:16px; border-top:1px solid var(--line);">
            <button type="button" class="btn primary" id="btnDeliverToReview" style="width:100%; justify-content:center; padding:12px 18px; font-weight:700; font-size:13.5px;">
              🚀 Entregar tarea para revisión del Lead (To Review)
            </button>
            <div style="margin-top:8px; font-size:11.5px; color:var(--muted); line-height:1.4; display:flex; align-items:center; gap:6px;">
              <span>ℹ️</span>
              <span>Al pulsar, se publica este comentario en la card de Jira y se mueve la tarea a la columna «To Review» para que el Lead valide el diseño.</span>
            </div>
          </div>

          <div class="handoff" id="handoff" hidden style="margin-top:16px;"></div>
        </div>
      </div>`;

// Check if oldAfterBlock matches
const hasExact = html.includes(oldAfterBlock);
console.log("Found exact match for oldAfterBlock:", hasExact);

if (!hasExact) {
  // Let's find by start and end
  const startIdx = html.indexOf('<div class="after">');
  const endIdx = html.indexOf('<!-- ================= SISTEMA ================= -->');
  const afterChunk = html.slice(startIdx, endIdx);
  // Find closing </div> of .after
  const lastCloseDiv = afterChunk.lastIndexOf('</div>\n      </div>');
  console.log("Chunk slice length:", afterChunk.length);
}
