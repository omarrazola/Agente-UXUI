import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");

// 1. Add inline onclick to #advBriefToggle if not present
html = html.replace(
  '<button type="button" id="advBriefToggle" class="adv-toggle-btn" aria-expanded="false"',
  '<button type="button" id="advBriefToggle" class="adv-toggle-btn" aria-expanded="false" onclick="window.toggleAdvBrief && window.toggleAdvBrief(event)"'
);

// 2. Identify the misplaced block inside hoOpenFigmaSync
const badBlockStart = '    if(e.target.closest("#hoOpenFigmaSync")){\n      var syncBox = $("#figmaSyncBox");\n      if(syncBox){\n        syncBox.hidden = false;\n        populateFigmaStepSelector();\n\n  // ---------- Sincronización Amigable de Briefing ----------';
// Let's find using regex to be resilient to CRLF
const badBlockRegex = /if\(e\.target\.closest\("#hoOpenFigmaSync"\)\)\{\s*var syncBox = \$\("#figmaSyncBox"\);\s*if\(syncBox\)\{\s*syncBox\.hidden = false;\s*populateFigmaStepSelector\(\);[\s\S]*?switchPhase\(1\);\s*syncBox\.scrollIntoView\(\{ behavior: "smooth", block: "center" \}\);\s*\$\("#figmaSyncUrl"\)\.focus\(\);\s*\}\s*return;\s*\}/;

const cleanHoBlock = `if(e.target.closest("#hoOpenFigmaSync")){
      var syncBox = $("#figmaSyncBox");
      if(syncBox){
        syncBox.hidden = false;
        populateFigmaStepSelector();
        syncBox.scrollIntoView({ behavior: "smooth", block: "center" });
        $("#figmaSyncUrl").focus();
      }
      return;
    }`;

if (!badBlockRegex.test(html)) {
  console.error("❌ Could not match badBlockRegex in public/index.html");
  process.exit(1);
}

html = html.replace(badBlockRegex, cleanHoBlock);

// 3. Add the proper initialization block before populateFigmaStepSelector() at the end
const properInitBlock = `
  // ---------- Sincronización Amigable de Briefing y Acordeón Avanzado ----------
  var fTitle = $("#friendlyTitleInput");
  var fDesc = $("#friendlyDescInput");
  var tTitleEl = $("#tTitle");
  var tBodyEl = $("#tBody");
  var advToggle = $("#advBriefToggle");
  var advBody = $("#advBriefBody");
  var advChevron = $("#advChevron");

  window.toggleAdvBrief = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!advBody) advBody = $("#advBriefBody");
    if (!advChevron) advChevron = $("#advChevron");
    if (!advToggle) advToggle = $("#advBriefToggle");
    if (!advBody) return;
    var isHidden = advBody.hasAttribute("hidden") || advBody.hidden;
    if (isHidden) {
      advBody.removeAttribute("hidden");
      advBody.hidden = false;
      if (advToggle) advToggle.setAttribute("aria-expanded", "true");
      if (advChevron) advChevron.textContent = "▴";
    } else {
      advBody.setAttribute("hidden", "");
      advBody.hidden = true;
      if (advToggle) advToggle.setAttribute("aria-expanded", "false");
      if (advChevron) advChevron.textContent = "▾";
    }
  };

  if (advToggle) {
    advToggle.addEventListener("click", window.toggleAdvBrief);
  }

  function syncFriendlyToInternal() {
    if (fTitle && tTitleEl) tTitleEl.textContent = fTitle.value.trim() || "Petición de diseño";
    if (fDesc && tBodyEl) {
      var val = fDesc.value.trim();
      tBodyEl.innerHTML = "<p>" + val.replace(/\\n/g, "<br>") + "</p>";
    }
  }

  function syncInternalToFriendly() {
    if (fTitle && tTitleEl) fTitle.value = tTitleEl.textContent.trim();
    if (fDesc && tBodyEl) {
      var plain = (tBodyEl.innerText || tBodyEl.textContent || "").trim();
      plain = plain.replace(/^Contexto\\.\\s*/i, "").replace(/Qué necesitamos\\.\\s*/i, "\\n\\n").trim();
      fDesc.value = plain;
    }
  }

  if (fTitle) fTitle.addEventListener("input", syncFriendlyToInternal);
  if (fDesc) fDesc.addEventListener("input", syncFriendlyToInternal);

  syncInternalToFriendly();
  switchPhase(1);

  // Populate initially
  populateFigmaStepSelector();`;

html = html.replace(/\/\/ Populate initially\s*populateFigmaStepSelector\(\);/, properInitBlock);

fs.writeFileSync("public/index.html", html, "utf8");
fs.writeFileSync("demo/index.html", html, "utf8");
console.log("✔ Fix applied to public/index.html and demo/index.html successfully!");
