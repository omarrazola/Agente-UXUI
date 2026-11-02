import fs from "fs";

let script = fs.readFileSync("scripts/test-ui-interactions.mjs", "utf8");
script = script.replace(
  `  { id: "reviewForm", type: "Form", name: "Formulario de Aprobación", action: "Valida checklist de entrega" },\n  { id: "approveBtn", type: "Submit", name: "Aprobar y enviar a desarrollo", action: "Cierra versión y genera handoff" },`,
  `  { id: "btnDeliverToReview", type: "Botón", name: "Entregar tarea para revisión del Lead (To Review)", action: "Mueve a To Review y publica comentario en Jira" },`
);

fs.writeFileSync("scripts/test-ui-interactions.mjs", script, "utf8");
console.log("Updated test-ui-interactions lines 62-63!");
