import fs from "fs";

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const badStr = 'alert("✅ Configuración guardada en tu navegador con éxito.\nLas peticiones se autenticarán con tus propias credenciales.");';
  const badStrCRLF = 'alert("✅ Configuración guardada en tu navegador con éxito.\r\nLas peticiones se autenticarán con tus propias credenciales.");';
  const goodStr = 'alert("✅ Configuración guardada en tu navegador con éxito.\\nLas peticiones se autenticarán con tus propias credenciales.");';

  if (content.includes(badStr)) {
    content = content.replace(badStr, goodStr);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Fixed in ${filePath} (LF)`);
  } else if (content.includes(badStrCRLF)) {
    content = content.replace(badStrCRLF, goodStr);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Fixed in ${filePath} (CRLF)`);
  } else {
    // regex fallback
    const regex = /alert\("✅ Configuración guardada en tu navegador con éxito\.\r?\nLas peticiones se autenticarán con tus propias credenciales\."\);/;
    if (regex.test(content)) {
      content = content.replace(regex, goodStr);
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed via regex in ${filePath}`);
    } else {
      console.log(`Target not found in ${filePath}`);
    }
  }
}

fixFile("public/index.html");
fixFile("demo/index.html");
