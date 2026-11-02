import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

// Extract script content
const scriptMatches = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
const allScripts = scriptMatches.map(m => m[1]).join("\n");

console.log("Analyzing public/index.html...");

// 1. Check Links <a>
console.log("\n=== 1. ANÁLISIS DE ENLACES (<a>) ===");
const aRegex = /<a\s+([^>]+)>(.*?)<\/a>/gis;
let aMatch;
const links = [];
while ((aMatch = aRegex.exec(html)) !== null) {
  const attrs = aMatch[1];
  const inner = aMatch[2].replace(/<[^>]+>/g, "").trim();
  const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
  const targetMatch = attrs.match(/target=["']([^"']*)["']/i);
  const href = hrefMatch ? hrefMatch[1] : null;
  links.push({ href, text: inner || "(icono/sin texto)", attrs });
}

let brokenLinks = 0;
for (const link of links) {
  if (!link.href || link.href === "" || link.href === "#") {
    // Check if it has an onclick or role=button or id with listener
    const idMatch = link.attrs.match(/id=["']([^"']*)["']/i);
    const onclickMatch = link.attrs.match(/onclick=["']([^"']*)["']/i);
    const hasHandler = onclickMatch || (idMatch && allScripts.includes(idMatch[1]));
    if (!hasHandler) {
      console.warn(`⚠️ Enlace sin destino claro: href="${link.href}" text="${link.text}" attrs: ${link.attrs}`);
      brokenLinks++;
    } else {
      console.log(`✔ Enlace funcional con JS: text="${link.text}"`);
    }
  } else if (link.href.startsWith("#")) {
    const targetId = link.href.slice(1);
    const exists = html.includes(`id="${targetId}"`) || html.includes(`id='${targetId}'`);
    if (!exists) {
      console.warn(`❌ Enlace ancla roto: href="${link.href}" (No existe #${targetId})`);
      brokenLinks++;
    } else {
      console.log(`✔ Enlace ancla válido: href="${link.href}"`);
    }
  } else {
    console.log(`✔ Enlace externo/recurso: href="${link.href}" text="${link.text}"`);
  }
}
console.log(`Total enlaces: ${links.length}. Rotos: ${brokenLinks}`);

// 2. Check Buttons <button>
console.log("\n=== 2. ANÁLISIS DE BOTONES (<button>) ===");
const btnRegex = /<button\s+([^>]*?)>(.*?)<\/button>/gis;
let btnMatch;
const buttons = [];
while ((btnMatch = btnRegex.exec(html)) !== null) {
  const attrs = btnMatch[1];
  const inner = btnMatch[2].replace(/<[^>]+>/g, "").trim().slice(0, 30);
  const idMatch = attrs.match(/id=["']([^"']*)["']/i);
  const classMatch = attrs.match(/class=["']([^"']*)["']/i);
  const onclickMatch = attrs.match(/onclick=["']([^"']*)["']/i);
  const typeMatch = attrs.match(/type=["']([^"']*)["']/i);

  buttons.push({
    id: idMatch ? idMatch[1] : null,
    className: classMatch ? classMatch[1] : null,
    onclick: onclickMatch ? onclickMatch[1] : null,
    type: typeMatch ? typeMatch[1] : null,
    text: inner,
    rawAttrs: attrs
  });
}

console.log(`Total botones en HTML: ${buttons.length}`);

const unhandledButtons = [];
const handledButtons = [];

for (const b of buttons) {
  let isHandled = false;
  let reason = "";

  if (b.onclick) {
    isHandled = true;
    reason = `onclick inline: ${b.onclick.slice(0, 30)}`;
  } else if (b.id) {
    // Check if id is referenced in script
    // e.g. $('#id'), document.getElementById('id'), getElementById("id"), etc.
    const reId = new RegExp(`['"\`]${b.id}['"\`]`, "g");
    if (reId.test(allScripts)) {
      isHandled = true;
      reason = `ID referenciado en script: #${b.id}`;
    }
  }

  // Check if handled by class or delegated handler
  if (!isHandled && b.className) {
    const classes = b.className.split(/\s+/).filter(Boolean);
    for (const c of classes) {
      if (allScripts.includes(`.${c}`) || allScripts.includes(`getElementsByClassName("${c}")`) || allScripts.includes(`"${c}"`)) {
        isHandled = true;
        reason = `Clase referenciada en script: .${c}`;
        break;
      }
    }
  }

  // Check common UI elements like form submit, modal dismiss, close, stepper
  if (!isHandled) {
    unhandledButtons.push(b);
  } else {
    handledButtons.push({ ...b, reason });
  }
}

console.log(`Botones con manejador directo/delegado: ${handledButtons.length}`);
console.log(`Botones sin manejador detectado: ${unhandledButtons.length}`);

if (unhandledButtons.length > 0) {
  console.log("\n⚠️ Lista de botones sin manejador detectado:");
  unhandledButtons.forEach((b, i) => {
    console.log(`  [${i + 1}] ID: ${b.id || "(sin id)"} | Class: ${b.className || "(sin clase)"} | Text: "${b.text}" | Attrs: ${b.rawAttrs.slice(0, 60)}`);
  });
}
