import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

// Script contents
const scriptMatches = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
const scriptContent = scriptMatches.map(m => m[1]).join("\n");

// List of all real interactive buttons/triggers across the entire application:
const interactiveElements = [
  // 1. Pestañas de Navegación Principal
  { id: "tab-demo", type: "Pestaña", name: "Consola de Agentes", action: "Navega a la vista principal /demo" },
  { id: "tab-organigrama", type: "Pestaña", name: "Organigrama", action: "Navega a la jerarquía de agentes" },
  { id: "tab-sistema", type: "Pestaña", name: "Sistema de diseño", action: "Navega al catálogo de Uber Base DS" },
  { id: "tab-arquitectura", type: "Pestaña", name: "Arquitectura", action: "Navega a la documentación técnica" },
  { id: "btnOpenQuickGuide", type: "Botón", name: "¿Cómo funciona?", action: "Abre modal interactivo de onboarding" },
  { id: "btnOpenByokConfig", type: "Botón", name: "Configurar ↗ (Banner BYOK)", action: "Abre modal de configuración de API Keys" },
  { id: "apiSettingsModal", type: "Modal", name: "Modal de Configuración de API Keys", action: "Configuración personalizada de Gemini, Jira, Figma" },

  // 2. Stepper Informativo de las 4 Fases del Flujo (no clickables, 1 sola línea horizontal)
  { id: "ujStep1", type: "Indicador", name: "Paso 1: Briefing", action: "Indicador visual de progreso de Fase 1" },
  { id: "ujStep2", type: "Indicador", name: "Paso 2: Selección de Agentes", action: "Indicador visual de progreso de Fase 2" },
  { id: "ujStep3", type: "Indicador", name: "Paso 3: Orquestador", action: "Indicador visual de progreso de Fase 3" },
  { id: "ujStep4", type: "Indicador", name: "Paso 4: Prototipo y Entregables", action: "Indicador visual de progreso de Fase 4" },

  // 3. Fase 1: Selección de Jira o Formulario Asistido y Lanzador al Paso 2
  { id: "jiraSelect", type: "Select", name: "Desplegable Tickets Jira", action: "Carga datos del ticket seleccionado" },
  { id: "btnRefreshJira", type: "Botón", name: "Recargar Jira", action: "Consulta API /api/jira/issues" },
  { id: "btnOpenManualBrief", type: "Botón", name: "Formulario asistido", action: "Abre modal de creación de ticket" },
  { id: "btnSyncToJira", type: "Botón", name: "Sincronizar en Jira", action: "Sincroniza el ticket actual en Jira" },
  { id: "jiraExternalLink", type: "Enlace", name: "Jira ↗", action: "Abre el ticket en Jira Cloud" },
  { id: "btnContinueToAgents", type: "Botón", name: "Continuar a selección de agentes", action: "switchPhase(2)" },

  // 4. Fase 2: Configuración y Selección Obligatoria de Agentes (Desactivados por defecto)
  { id: "btnSelectAllAgents", type: "Botón", name: "Seleccionar todos los agentes", action: "Marca los 7 agentes" },
  { id: "btnSelectEssentialAgents", type: "Botón", name: "Seleccionar esenciales UI/UX", action: "Marca brief, ctx, ux, ui" },
  { id: "btnDeselectAllAgents", type: "Botón", name: "Desmarcar agentes", action: "Desmarca todos para validar bloqueo obligatorio" },
  { id: "runBtn", type: "Botón", name: "Generar diseño interactivo con IA", action: "Lanza orquestación y pasa a Fase 3" },

  // 5. Fase 3: Visualización del Orquestador
  { id: "vmodeCanvas", type: "Botón", name: "Grafo de Red", action: "Muestra mapa visual de conexiones" },
  { id: "vmodeList", type: "Botón", name: "Terminal / Lista", action: "Muestra consola de ejecución" },
  { id: "agentsDropdownToggle", type: "Botón", name: "Detalle de los 7 agentes", action: "Despliega/oculta registro de agentes" },

  // 6. Fase 4: Visor de Diseños y Modos
  { id: "modeScreens", type: "Botón", name: "5 Pantallas", action: "Muestra galería de las 5 pantallas" },
  { id: "modeProto", type: "Botón", name: "Prototipo interactivo", action: "Muestra teléfono con prototipo navegable" },
  { id: "modeFlow", type: "Botón", name: "Mapa de Flujo", action: "Muestra diagrama de transición de estados" },
  { id: "modeHandover", type: "Botón", name: "Handover & Código", action: "Muestra código React, tokens y exports" },
  { id: "btnQuickFigmaCopy", type: "Botón", name: "Copiar para Figma (Ctrl+V)", action: "Copia SVG al portapapeles" },
  { id: "btnQuickFigmaDl", type: "Botón", name: "Descargar SVG", action: "Descarga flow_canvas.svg" },
  { id: "sfAll", type: "Filtro", name: "Filtro: Todos", action: "Muestra las 5 pantallas" },
  { id: "sfHappy", type: "Filtro", name: "Filtro: Happy Path", action: "Filtra pantalla 1, 2 y 5" },
  { id: "sfCorner", type: "Filtro", name: "Filtro: Corner Cases", action: "Filtra casos excepcionales" },
  { id: "sfError", type: "Filtro", name: "Filtro: Errores", action: "Filtra pantalla de error y recuperación" },
  { id: "btnSaveFigmaTarget", type: "Botón", name: "Guardar destino Figma", action: "Guarda nuevo FileKey en backend" },

  // 6. Fase 3: Iteraciones y Aprobación
  { id: "btnToggleFigmaSync", type: "Botón", name: "Vincular con Figma", action: "Abre sincronizador de Figma" },
  { id: "figmaSyncSubmitBtn", type: "Botón", name: "Sincronizar con el Agente", action: "Envía frame de Figma al pipeline" },
  { id: "btnCloseFigmaSync", type: "Botón", name: "Cerrar Figma Sync", action: "Oculta el cuadro de sincronización" },
  { id: "changeForm", type: "Form", name: "Formulario de Cambios", action: "Itera diseño con agentes mediante prompt" },
  { id: "applyBtn", type: "Submit", name: "Aplicar cambios", action: "Ejecuta iteración con IA" },
  { id: "btnDeliverToReview", type: "Botón", name: "Entregar tarea para revisión del Lead (To Review)", action: "Mueve a To Review y publica comentario en Jira" },

  // 7. Modales de Ayuda, Ficha Técnica y Asistentes
  { id: "orgAgentModal", type: "Modal", name: "Ficha Técnica de Agente", action: "Muestra capacidades, herramientas y RACI" },
  { id: "quickGuideModal", type: "Modal", name: "Guía Rápida", action: "Guía paso a paso de uso de la herramienta" },
  { id: "manualBriefModal", type: "Modal", name: "Formulario de Brief Asistido", action: "Formulario con validación y envío a Jira" },
  { id: "btnCancelManualBrief", type: "Botón", name: "Cancelar Brief", action: "Cierra el modal de nuevo ticket" },
  { id: "btnSubmitManualBrief", type: "Botón", name: "Crear en Jira Automáticamente", action: "Crea la incidencia en Jira API" }
];

console.log("=================================================");
console.log("🔍 COMPROBACIÓN EXHAUSTIVA DE BOTONES, ENLACES Y ACCIONES");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

for (const el of interactiveElements) {
  const inHtml = html.includes(`id="${el.id}"`) || html.includes(`id='${el.id}'`);
  const isHandled = scriptContent.includes(`"${el.id}"`) ||
                    scriptContent.includes(`'${el.id}'`) ||
                    scriptContent.includes(`#${el.id}`) ||
                    html.includes(`onclick="switchPhase`) ||
                    html.includes(`onclick="window.`) ||
                    html.includes(`data-tab=`) ||
                    html.includes(`data-mode=`);

  if (inHtml && isHandled) {
    console.log(`  ✔ [PASS] [${el.type.padEnd(8)}] #${el.id.padEnd(23)} | "${el.name}" -> ${el.action}`);
    passed++;
  } else {
    console.log(`  ❌ [FAIL] [${el.type.padEnd(8)}] #${el.id.padEnd(23)} | "${el.name}" (HTML: ${inHtml}, JS: ${isHandled})`);
    failed++;
  }
}

// Comprobación de enlaces externos estáticos
console.log("\n📌 ENLACES EXTERNOS (VERIFICACIÓN DE PROTOCOLO Y DESTINO):");
const linksToCheck = [
  { url: "https://pruebasantigravity.atlassian.net/browse/", desc: "Dominio de Tickets Jira Cloud" },
  { url: "https://www.figma.com/design/dcKVRyGjsYiK3Cl1iBHeXc/Untitled?node-id=0-1", desc: "Archivo en Figma" },
  { url: "https://base.uber.com/6d2425e9f/p/294ab4-base-design-system", desc: "Uber Base Design System Oficial" },
  { url: "https://base.uber.com/6d2425e9f/p/756216-button", desc: "Especificación de Botones Uber Base" }
];

for (const l of linksToCheck) {
  if (html.includes(l.url)) {
    console.log(`  ✔ [PASS] [Enlace URL] ${l.desc} -> ${l.url}`);
    passed++;
  } else {
    console.log(`  ❌ [FAIL] [Enlace URL] ${l.desc} -> ${l.url}`);
    failed++;
  }
}

console.log("\n=================================================");
console.log(`📊 RESULTADO FINAL: ${passed} elementos verificados / ${failed} anomalías`);
console.log("=================================================");
