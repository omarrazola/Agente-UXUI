import http from "node:http";
import { WebSocket } from "ws";

const BASE_URL = "http://localhost:8787";
const WS_URL = "ws://localhost:8787";

console.log("=================================================");
console.log("🔍 COMPROBACIÓN EXHAUSTIVA DE TODAS LAS FUNCIONALIDADES");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || "GET";
  const headers = options.headers || {};
  const body = options.body ? JSON.stringify(options.body) : null;
  if (body) {
    headers["Content-Type"] = "application/json";
    headers["Content-Length"] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, text: data, json });
      });
    });

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function test(name, condition, extra = "") {
  if (condition) {
    passed++;
    console.log(`  ✔ [PASS] ${name} ${extra ? `(${extra})` : ""}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} ${extra ? `(${extra})` : ""}`);
  }
}

async function runAllChecks() {
  try {
    // 1. Healthcheck
    console.log("1️⃣ SERVIDOR Y HEALTHCHECK:");
    const health = await request("/health");
    test("Healthcheck /health responde 200 OK", health.status === 200);
    test("Servidor devuelve ok: true", health.json && health.json.ok === true);

    // 2. Frontend de la herramienta
    console.log("\n2️⃣ FRONTEND WEB Y SISTEMA DE 4 FASES:");
    const index = await request("/");
    test("Ruta raíz / sirve index.html con 200 OK", index.status === 200);
    test("Contiene título Garaje de Ideas / Base Design Agents", index.text.includes("GARAJE DE IDEAS"));
    test("Contiene Stepper de 4 fases", index.text.includes("Flujo de la herramienta en 4 fases"));
    test("Fase 1 contiene selector de tickets de Jira y botón para avanzar a agentes", 
      index.text.includes('id="jiraSelect"') && index.text.includes('id="btnContinueToAgents"'));
    test("Fase 2 es paso independiente para selección obligatoria de agentes", 
      index.text.includes('id="agentSelectPanel"') && index.text.includes('id="agentSelectionAlert"'));
    test("Fase 2 contiene botón de ejecución con IA (#runBtn)", 
      index.text.includes('id="runBtn"'));
    test("Fase 3 contiene orquestador con lienzo de red y circuitos", index.text.includes('id="orchestratorPanel"') && index.text.includes('orch-svg-canvas'));
    test("Fase 3 contiene drop opcional para detalle de los 7 agentes", index.text.includes('id="agentsDropdownWrapper"'));
    test("Fase 4 contiene simulador y prototipo", index.text.includes('id="viewer"'));
    test("Fase 4 contiene tarjeta de Figma colapsable", index.text.includes('figma-target-collapse'));

    // 3. Integración con Jira
    console.log("\n3️⃣ INTEGRACIÓN CON JIRA (API REAL Y TICKETS):");
    const jiraIssues = await request("/api/jira/issues");
    test("Endpoint /api/jira/issues responde 200 OK", jiraIssues.status === 200);
    test("Devuelve lista de incidencias válidas de Jira KAN", 
      jiraIssues.json && jiraIssues.json.ok && Array.isArray(jiraIssues.json.issues), 
      `Issues activas encontradas: ${jiraIssues.json?.issues?.length || 0}`);
    if (jiraIssues.json?.issues?.length > 0) {
      const first = jiraIssues.json.issues[0];
      test("Incidencias contienen key, título y descripción", 
        !!first.key && !!first.title && !!first.description, 
        `Ejemplo real: ${first.key} - "${first.title.slice(0, 35)}..."`);
    }

    // 4. Integración con Figma (API y Exportaciones)
    console.log("\n4️⃣ INTEGRACIÓN CON FIGMA (API Y EXPORT):");
    const figmaTarget = await request("/api/figma/target");
    test("Endpoint /api/figma/target responde 200 OK", figmaTarget.status === 200);
    test("Devuelve fileKey configurado", !!figmaTarget.json?.fileKey, `fileKey: ${figmaTarget.json?.fileKey}`);

    const figmaSvg = await request("/api/figma/svg");
    test("Endpoint /api/figma/svg genera SVG vectorial del flujo", figmaSvg.status === 200 && figmaSvg.text.includes("<svg"));

    const figmaExport = await request("/api/figma/export", {
      method: "POST",
      body: {
        key: "KAN-TEST",
        screens: [
          { name: "Screen 1", title: "Pantalla 1", html: "<div>Test</div>", components: [] }
        ]
      }
    });
    test("Endpoint /api/figma/export genera plugin script listo para el lienzo", 
      figmaExport.status === 200 && figmaExport.json?.ok === true && !!figmaExport.json?.pluginScript);

    const figmaPending = await request("/api/figma/pending");
    test("Endpoint /api/figma/pending devuelve el último diseño listo para importar", 
      figmaPending.status === 200 && figmaPending.json?.screens?.length > 0);

    // 5. WebSocket en tiempo real para el plugin de Figma
    console.log("\n5️⃣ WEBSOCKET LIVE BRIDGE (FIGMA PLUGIN):");
    const wsPromise = new Promise((resolve) => {
      const ws = new WebSocket(WS_URL);
      let connected = false;
      let receivedPush = false;

      ws.on("open", async () => {
        connected = true;
        test("WebSocket conecta exitosamente en ws://localhost:8787", true);

        // Disparamos un push desde el servidor para verificar que el cliente WS lo recibe
        await request("/api/figma/push", { method: "POST" });
      });

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "RENDER_FLOW_MAP" || msg.screens) {
            receivedPush = true;
            test("WebSocket recibe orden RENDER_FLOW_MAP emitida por el servidor", true);
            ws.close();
            resolve(true);
          }
        } catch (e) {
          console.error("Error parseando mensaje WS:", e);
        }
      });

      ws.on("error", (err) => {
        test("WebSocket conecta exitosamente", false, err.message);
        resolve(false);
      });

      setTimeout(() => {
        if (!connected) test("WebSocket conecta exitosamente", false, "Timeout");
        if (!receivedPush) test("WebSocket recibe orden del servidor", false, "Timeout");
        ws.close();
        resolve(false);
      }, 3000);
    });

    await wsPromise;

    // 6. Webhooks (Trello y Jira)
    console.log("\n6️⃣ SISTEMA DE WEBHOOKS:");
    const trelloHead = await request("/webhooks/trello", { method: "HEAD" });
    test("Webhook Trello responde 200 al handshake HEAD", trelloHead.status === 200);

    // 7. Pipeline de Orquestación y API de Runs
    console.log("\n7️⃣ PIPELINE Y GESTIÓN DE RUNS:");
    const testKey = "KAN-VERIFY-" + Date.now();
    const runCreate = await request("/api/runs", {
      method: "POST",
      body: {
        key: testKey,
        title: "Verificación de Integración",
        description: "Prueba automática integral del pipeline"
      }
    });
    test("Creación de run en pipeline responde 202 Accepted", runCreate.status === 202 && runCreate.json?.ok === true);

    const runGet = await request("/api/runs/KAN-28");
    test("Recuperación de run histórico (KAN-28) responde con éxito", runGet.status === 200 && runGet.json?.key === "KAN-28");

    // 8. Resumen Final
    console.log("\n=================================================");
    console.log(`📊 RESULTADOS: ${passed} pruebas superadas / ${failed} fallos`);
    console.log("=================================================");

    if (failed === 0) {
      console.log("\n🎉 TODAS LAS INTEGRACIONES Y FUNCIONALIDADES ESTÁN AL 100% OPERATIVAS.");
    } else {
      console.log(`\n⚠️ Se detectaron ${failed} anomalías.`);
    }

  } catch (err) {
    console.error("Error durante las pruebas:", err);
  }
}

runAllChecks();
