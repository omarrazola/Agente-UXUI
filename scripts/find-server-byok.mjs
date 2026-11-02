import fs from "fs";

function searchDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = dir + "/" + f.name;
    if (f.isDirectory() && f.name !== "node_modules" && f.name !== ".git") {
      searchDir(full);
    } else if (f.isFile() && (f.name.endsWith(".ts") || f.name.endsWith(".js"))) {
      const txt = fs.readFileSync(full, "utf8");
      if (txt.includes("x-gemini") || txt.includes("x-jira") || txt.includes("x-llm") || txt.includes("byok") || txt.includes("/api/config") || txt.includes("/api/keys")) {
        console.log(`Found in ${full}`);
      }
    }
  }
}

searchDir("src");
