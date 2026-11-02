import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf('<div class="panel" id="approvePanel">');
const end = html.indexOf('<div class="handoff" id="handoff" hidden></div>', start);
console.log("Found chunk:", JSON.stringify(html.slice(start, end)));

const replacement = `<div class="panel" id="approvePanel">
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
          `;

html = html.slice(0, start) + replacement + html.slice(end);
fs.writeFileSync("public/index.html", html, "utf8");
fs.writeFileSync("demo/index.html", html, "utf8");
console.log("Approve panel successfully replaced in public & demo!");
