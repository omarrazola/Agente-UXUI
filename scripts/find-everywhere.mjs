import fs from "fs";

function searchAll(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = dir + "/" + ent.name;
    if (ent.isDirectory()) {
      if (ent.name !== "node_modules" && ent.name !== ".git" && ent.name !== "dist") {
        searchAll(full);
      }
    } else if (ent.isFile() && (ent.name.endsWith(".html") || ent.name.endsWith(".ts") || ent.name.endsWith(".js") || ent.name.endsWith(".mjs"))) {
      const content = fs.readFileSync(full, "utf8");
      if (content.includes("solicitud de cambios") || content.includes("haría esto") || content.includes("Listo para desarrollo")) {
        console.log(`Found in: ${full}`);
        const lines = content.split("\n");
        lines.forEach((l, i) => {
          if (l.includes("solicitud de cambios") || l.includes("haría esto") || l.includes("Listo para desarrollo")) {
            console.log(`  Line ${i+1}: ${l.trim().slice(0, 100)}`);
          }
        });
      }
    }
  }
}

searchAll(".");
