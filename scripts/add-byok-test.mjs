import fs from "fs";

let script = fs.readFileSync("scripts/test-ui-interactions.mjs", "utf8");
script = script.replace(
  `{ id: "btnOpenQuickGuide", type: "Botón", name: "¿Cómo funciona?", action: "Abre modal interactivo de onboarding" },`,
  `{ id: "btnOpenQuickGuide", type: "Botón", name: "¿Cómo funciona?", action: "Abre modal interactivo de onboarding" },\n  { id: "btnOpenByokConfig", type: "Botón", name: "Configurar ↗ (Banner BYOK)", action: "Abre modal de configuración de API Keys" },\n  { id: "apiSettingsModal", type: "Modal", name: "Modal de Configuración de API Keys", action: "Configuración personalizada de Gemini, Jira, Figma" },`
);

fs.writeFileSync("scripts/test-ui-interactions.mjs", script, "utf8");
console.log("Updated test-ui-interactions.mjs with BYOK modal!");
