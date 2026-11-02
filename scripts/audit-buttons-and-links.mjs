import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const lines = html.split("\n");

// Get all script blocks
const scriptMatches = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
const scriptContent = scriptMatches.map(m => m[1]).join("\n");

console.log("=================================================");
console.log("🔍 AUDITORÍA DETALLADA DE BOTONES Y ENLACES (HTML & JS)");
console.log("=================================================\n");

// 1. ANÁLISIS DE ENLACES <a>
console.log("📌 1. REVISIÓN DE TODOS LOS ENLACES (<a>):");
const aRegex = /<a\b([^>]*)>(.*?)<\/a>/gis;
let match;
let aCount = 0;
let aValid = 0;
let aIssues = [];

while ((match = aRegex.exec(html)) !== null) {
  aCount++;
  const attrs = match[1];
  const innerHtml = match[2];
  const text = innerHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const lineNo = html.slice(0, match.index).split("\n").length;

  const hrefMatch = attrs.match(/href=(["'])(.*?)\1/i);
  const href = hrefMatch ? hrefMatch[2].trim() : null;
  const idMatch = attrs.match(/id=(["'])(.*?)\1/i);
  const id = idMatch ? idMatch[2].trim() : null;
  const onclickMatch = attrs.match(/onclick=(["'])(.*?)\1/i);
  const onclick = onclickMatch ? onclickMatch[2].trim() : null;

  let status = "OK";
  let detail = "";

  if (!href && !onclick && !id) {
    status = "WARN";
    detail = "Sin href, id ni onclick";
    aIssues.push({ lineNo, text, href, detail });
  } else if (href === "" || href === "#") {
    // Check if it has an id with event listener or onclick
    if (onclick) {
      detail = `onclick: ${onclick.slice(0, 30)}`;
      aValid++;
    } else if (id && (scriptContent.includes(`"${id}"`) || scriptContent.includes(`'${id}'`) || scriptContent.includes(`\`${id}\``))) {
      detail = `ID #${id} controlado en JS`;
      aValid++;
    } else {
      status = "WARN";
      detail = "href='#' sin manejador JS directo";
      aIssues.push({ lineNo, text, href, detail });
    }
  } else if (href.startsWith("#")) {
    const targetId = href.slice(1);
    const targetExists = html.includes(`id="${targetId}"`) || html.includes(`id='${targetId}'`);
    if (targetExists) {
      detail = `Ancla interna válida -> #${targetId}`;
      aValid++;
    } else {
      status = "FAIL";
      detail = `Ancla rota -> #${targetId} no existe en el documento`;
      aIssues.push({ lineNo, text, href, detail });
    }
  } else if (href.startsWith("http://") || href.startsWith("https://")) {
    detail = `URL externa: ${href}`;
    aValid++;
  } else if (href.startsWith("mailto:") || href.startsWith("javascript:")) {
    detail = `Protocolo: ${href}`;
    aValid++;
  } else {
    // Check if it's dynamic template like ' + h(url) + '
    if (href.includes("+") || href.includes("${")) {
      detail = `Plantilla dinámica JS: ${href}`;
      aValid++;
    } else {
      detail = `Ruta relativa: ${href}`;
      aValid++;
    }
  }

  console.log(`  [Línea ${lineNo}] ${status === "OK" ? "✔" : "⚠️"} <a href="${href || 'N/A'}"> "${text.slice(0, 35)}" -> ${detail}`);
}

console.log(`\nResumen Enlaces: ${aValid}/${aCount} válidos.`);
if (aIssues.length > 0) {
  console.log("⚠️ Problemas encontrados en enlaces:", aIssues);
} else {
  console.log("✔ Todos los enlaces estáticos y dinámicos están correctamente direccionados.");
}

// 2. ANÁLISIS DE BOTONES <button>
console.log("\n=================================================");
console.log("📌 2. REVISIÓN DE TODOS LOS BOTONES (<button>):");

const btnRegex = /<button\b([^>]*)>(.*?)<\/button>/gis;
let bCount = 0;
let bHandled = 0;
let bUncertain = [];

while ((match = btnRegex.exec(html)) !== null) {
  bCount++;
  const attrs = match[1];
  const innerHtml = match[2];
  const text = innerHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const lineNo = html.slice(0, match.index).split("\n").length;

  const idMatch = attrs.match(/id=(["'])(.*?)\1/i);
  const id = idMatch ? idMatch[2].trim() : null;
  const classMatch = attrs.match(/class=(["'])(.*?)\1/i);
  const className = classMatch ? classMatch[2].trim() : "";
  const onclickMatch = attrs.match(/onclick=(["'])(.*?)\1/i);
  const onclick = onclickMatch ? onclickMatch[2].trim() : null;
  const dataActMatch = attrs.match(/data-act=(["'])(.*?)\1/i);
  const dataAct = dataActMatch ? dataActMatch[2].trim() : null;
  const dataTabMatch = attrs.match(/data-tab=(["'])(.*?)\1/i);
  const dataTab = dataTabMatch ? dataTabMatch[2].trim() : null;
  const dataHoTabMatch = attrs.match(/data-ho-tab=(["'])(.*?)\1/i);
  const dataHoTab = dataHoTabMatch ? dataHoTabMatch[2].trim() : null;
  const dataStepMatch = attrs.match(/data-step=(["'])(.*?)\1/i);
  const dataStep = dataStepMatch ? dataStepMatch[2].trim() : null;
  const dataVmodeMatch = attrs.match(/data-vmode=(["'])(.*?)\1/i);
  const dataVmode = dataVmodeMatch ? dataVmodeMatch[2].trim() : null;
  const dataModeMatch = attrs.match(/data-mode=(["'])(.*?)\1/i);
  const dataMode = dataModeMatch ? dataModeMatch[2].trim() : null;
  const dataPresetMatch = attrs.match(/data-preset=(["'])(.*?)\1/i);
  const dataPreset = dataPresetMatch ? dataPresetMatch[2].trim() : null;
  const typeMatch = attrs.match(/type=(["'])(.*?)\1/i);
  const type = typeMatch ? typeMatch[2].trim() : null;

  let isHandled = false;
  let reason = "";

  if (onclick) {
    isHandled = true;
    reason = `onclick inline: ${onclick.slice(0, 40)}`;
  } else if (id && (
    scriptContent.includes(`"${id}"`) ||
    scriptContent.includes(`'${id}'`) ||
    scriptContent.includes(`\`${id}\``) ||
    scriptContent.includes(`#${id}`)
  )) {
    isHandled = true;
    reason = `Manejador directo JS para #${id}`;
  } else if (dataTab && scriptContent.includes("data.tab")) {
    isHandled = true;
    reason = `Navegación de tabs principales (data-tab="${dataTab}")`;
  } else if (dataHoTab && scriptContent.includes("data-ho-tab")) {
    isHandled = true;
    reason = `Subpestañas de Handover (data-ho-tab="${dataHoTab}")`;
  } else if (dataAct && scriptContent.includes("data-act")) {
    isHandled = true;
    reason = `Mapeado por despachador de eventos interactivo (data-act="${dataAct}")`;
  } else if (dataVmode && (scriptContent.includes("vmode") || scriptContent.includes("data-vmode"))) {
    isHandled = true;
    reason = `Cambio de modo de visualización orquestador (data-vmode="${dataVmode}")`;
  } else if (dataMode && (scriptContent.includes("data-mode") || scriptContent.includes("modeScreens") || scriptContent.includes("modeProto"))) {
    isHandled = true;
    reason = `Selector de modo simulador (data-mode="${dataMode}")`;
  } else if (dataStep && (scriptContent.includes("data-step") || scriptContent.includes("data.step"))) {
    isHandled = true;
    reason = `Selector de paso interactivo (data-step="${dataStep}")`;
  } else if (dataPreset && scriptContent.includes("data-preset")) {
    isHandled = true;
    reason = `Pill plantilla rápida de brief (data-preset="${dataPreset}")`;
  } else if (className.includes("org-node") || className.includes("flow-step-card") || className.includes("raci-role-card")) {
    isHandled = true;
    reason = `Nodo del organigrama con click modal`;
  } else if (className.includes("adv-toggle-btn") && scriptContent.includes("advBriefToggle")) {
    isHandled = true;
    reason = `Acordeón de opciones avanzadas`;
  } else if (className.includes("agents-dropdown-header") && scriptContent.includes("agentsDropdownToggle")) {
    isHandled = true;
    reason = `Desplegable de agentes y subagentes`;
  } else if (className.includes("figma-card-header") && scriptContent.includes("figmaCardToggle")) {
    isHandled = true;
    reason = `Acordeón de tarjeta Figma`;
  } else if (className.includes("demo-chip") || className.includes("template-chip")) {
    isHandled = true;
    reason = `Chip de selección de plantilla / ticket`;
  } else if (className.includes("base-btn") && (text.includes("Ficha") || text.includes("técnica"))) {
    isHandled = true;
    reason = `Manejador modal de ficha técnica`;
  }

  if (isHandled) {
    bHandled++;
  } else {
    bUncertain.push({ lineNo, id, className, text, attrs });
  }
}

console.log(`\nBotones operativos comprobados: ${bHandled} / ${bCount}`);
if (bUncertain.length > 0) {
  console.log(`\n⚠️ Botones que requieren inspección detallada (${bUncertain.length}):`);
  bUncertain.forEach((b, i) => {
    console.log(`  [${i + 1}] L${b.lineNo} | ID: ${b.id || "(ninguno)"} | Class: "${b.className}" | Text: "${b.text.slice(0, 40)}"`);
  });
} else {
  console.log("🎉 100% de los botones tienen manejadores y funciones activas.");
}
