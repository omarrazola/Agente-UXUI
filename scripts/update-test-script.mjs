import fs from "fs";

let script = fs.readFileSync("scripts/test-ui-interactions.mjs", "utf8");
script = script.replace(
  `{ id: "#approveBtn", type: "Submit  ", name: "Aprobar y enviar a desarrollo", action: "Cierra versión y genera handoff" },`,
  `{ id: "#btnDeliverToReview", type: "Botón   ", name: "Entregar tarea para revisión del Lead (To Review)", action: "Mueve a To Review y publica comentario en Jira" },`
);
// Make reviewForm optional or check if exists
script = script.replace(
  `{ id: "#reviewForm", type: "Form    ", name: "Formulario de Aprobación", action: "Valida checklist de entrega" },`,
  `{ id: "#ticketDeliveryPanel", type: "Panel   ", name: "Comentario y Entrega en Jira", action: "Contenedor de entrega directa al Lead" },`
);
fs.writeFileSync("scripts/test-ui-interactions.mjs", script, "utf8");
console.log("test-ui-interactions.mjs updated!");
