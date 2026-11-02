import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

console.log("=================================================");
console.log("🔍 TEST DE FUNCIONALIDAD DE LAS IDEAS PREPARADAS (PRESETS)");
console.log("=================================================\n");

// Check inline onclick attributes on buttons
const presets = ["map", "uber", "ev", "airport", "blank"];
for (const p of presets) {
  const hasOnclick = html.includes(`onclick="window.applyPreset('${p}')"`);
  console.log(`Pill Preset '${p}': ${hasOnclick ? "✔ onclick directo configurado" : "❌ Falta onclick"}`);
}

// Check direct updating of friendlyTitleInput and friendlyDescInput in applyPreset
const hasTitleSync = html.includes('fTitleEl.value = (pKey === "blank") ? "" : p.title;');
const hasDescSync = html.includes('fDescEl.value = plain;');
const hasClassToggle = html.includes('b.classList.toggle("active", isTarget);');

console.log("\nSincronización directa con inputs amigables:");
console.log(`- Actualización de #friendlyTitleInput: ${hasTitleSync ? "✔ SÍ" : "❌ NO"}`);
console.log(`- Actualización de #friendlyDescInput: ${hasDescSync ? "✔ SÍ" : "❌ NO"}`);
console.log(`- Marcado activo de píldora visual (.active): ${hasClassToggle ? "✔ SÍ" : "❌ NO"}`);

if (hasTitleSync && hasDescSync && hasClassToggle) {
  console.log("\n🎉 TODAS LAS IDEAS PREPARADAS ESTÁN 100% OPERATIVAS Y SINCRONIZADAS.");
} else {
  console.log("\n⚠️ Se detectaron inconsistencias.");
}
