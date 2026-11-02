import fs from "fs";

function searchInFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((l, i) => {
    if (l.toLowerCase().includes("elige ticket") || l.includes("Elige ticket") || l.includes("Elige la tarea")) {
      console.log(`${file}:${i + 1}: ${l.trim().slice(0, 100)}`);
    }
  });
}

searchInFile("public/index.html");
searchInFile("demo/index.html");
searchInFile("src/server.ts");
searchInFile("src/integrations/jira.ts");
