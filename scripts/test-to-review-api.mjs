import fetch from "node-fetch";

async function test() {
  const res = await fetch("http://localhost:8787/api/handoff/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "KAN-28",
      version: 1,
      summary: "Flujo Uber Reserve con tarifa fija, selector de fecha y PIN nocturno",
      design: {
        screens: [
          { step: 1, shortName: "1. Selección de viaje", mainTitle: "¿A dónde vamos?" },
          { step: 2, shortName: "2. Uber Reserve", mainTitle: "Reserva con antelación" },
          { step: 3, shortName: "3. Confirmación", mainTitle: "Reserva confirmada" }
        ],
        theme: { cta: "Negro sólido (#000000)", radius: "8px", density: "Default" }
      },
      criteria: [
        "El flujo responde al alcance y requerimientos del brief",
        "Componentes y tokens 100% alineados con Uber Base DS",
        "Accesibilidad WCAG 2.1 AA y criterios de diseño validados"
      ]
    })
  });

  const data = await res.json();
  console.log("RESPONSE:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
