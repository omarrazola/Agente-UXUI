process.env.TEST_MODE = "true";
import http from "node:http";

async function runTests() {
  const { app } = await import("../dist/server.js");
  console.log("=== INICIANDO PRUEBAS DE INTEGRACIÓN DEL SERVIDOR ===");
  
  // Usar puerto efímero 0 para pruebas independientes
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;
  const base = `http://localhost:${port}`;
  console.log(`Servidor de prueba montado en puerto efímero ${port}`);

  let failed = 0;
  async function testEndpoint(name, url, options = {}) {
    try {
      const res = await fetch(`${base}${url}`, options);
      if (!res.ok) {
        console.error(`❌ [FALLO] ${name} (${url}): Status ${res.status}`);
        failed++;
        return null;
      }
      console.log(`✔ [OK] ${name} (${url}): Status ${res.status}`);
      return res;
    } catch (e) {
      console.error(`❌ [FALLO] ${name} (${url}): ${e.message}`);
      failed++;
      return null;
    }
  }

  // 1. Healthcheck
  const rHealth = await testEndpoint("Healthcheck", "/health");
  if (rHealth) {
    const data = await rHealth.json();
    console.log("   Health payload:", JSON.stringify(data));
  }

  // 2. Index Web
  const rIndex = await testEndpoint("Index Web", "/");
  if (rIndex) {
    const html = await rIndex.text();
    console.log(`   HTML recibido: ${html.length} bytes`);
  }

  // 3. BYOK Config Status
  const rConfigStatus = await testEndpoint("BYOK Config Status", "/api/config/status");
  if (rConfigStatus) {
    const data = await rConfigStatus.json();
    console.log("   Config status payload:", JSON.stringify(data));
    if (!data.serverConfig) {
      console.error("   ❌ serverConfig no vino en la respuesta");
      failed++;
    }
  }

  // 4. BYOK Config Test (Figma con token inválido esperado)
  const rConfigTest = await testEndpoint("BYOK Config Test Endpoint", "/api/config/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: "figma", token: "test_token_invalid" })
  });
  if (rConfigTest) {
    const data = await rConfigTest.json();
    console.log("   Config test validation result:", JSON.stringify(data));
  }

  // 5. Figma Pending
  const rFigma = await testEndpoint("Figma Pending Design", "/api/figma/pending");
  if (rFigma) {
    const data = await rFigma.json();
    console.log(`   Screens disponibles: ${data.screens?.length || 0}`);
  }

  // 6. Figma Target
  const rTarget = await testEndpoint("Figma Target", "/api/figma/target");
  if (rTarget) {
    const data = await rTarget.json();
    console.log("   Target fileKey:", data.fileKey);
  }

  // 7. Figma SVG Export
  const rSvg = await testEndpoint("Figma SVG Flow", "/api/figma/svg");
  if (rSvg) {
    const svg = await rSvg.text();
    console.log(`   SVG exportado correctamente: ${svg.length} bytes`);
  }

  // 8. Figma Console Script
  const rScript = await testEndpoint("Figma Console Script", "/api/figma/console-script");
  if (rScript) {
    const js = await rScript.text();
    console.log(`   Console script generado: ${js.length} bytes`);
  }

  // 9. Figma Orchestration Script
  const rOrch = await testEndpoint("Figma Orchestration Script", "/api/figma/orchestration-script");
  if (rOrch) {
    const js = await rOrch.text();
    console.log(`   Orchestration script generado: ${js.length} bytes`);
  }

  await new Promise((resolve) => testServer.close(resolve));
  
  if (failed === 0) {
    console.log("\n🎉 TODAS LAS PRUEBAS DE INTEGRACIÓN DEL SERVIDOR HAN PASADO AL 100%!\n");
  } else {
    console.error(`\n❌ ${failed} pruebas han fallado.\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Error fatal en pruebas:", err);
  process.exit(1);
});
