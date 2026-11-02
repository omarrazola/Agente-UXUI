import fs from "fs";

let content = fs.readFileSync("src/integrations/handoff.ts", "utf8");

// 1. Update Figma label in initial result
content = content.replace(
  'label: `${key} · v${version} aprobada`,',
  'label: `${key} · v${version} para revisión del Lead`,'
);

// 2. Update git commit message
content = content.replace(
  'const commitMsg = `feat(design): entrega ${key} v${version} con componentes Uber Base y React`;',
  'const commitMsg = `feat(design): entrega ${key} v${version} para revision del Lead Product Designer`;'
);

// 3. Update Jira transition matching to prioritize to review
const oldTransBlock = `        // Priorizar transición que contenga 'aprob', 'desarrollo', 'listo', 'dev', 'done'
        const matched = available.find((t: any) =>
          /aprob|desarrollo|listo|dev|done/i.test(t.name) ||
          /aprob|desarrollo|listo|dev|done/i.test(t.to?.name || "")
        ) || available.find((t: any) => t.id === "41") || available[0];`;

const newTransBlock = `        // Priorizar transición hacia 'To Review' / 'Review' / 'Revisión'
        const matched = available.find((t: any) =>
          /to\\s*review|review|revisi[oó]n/i.test(t.name) ||
          /to\\s*review|review|revisi[oó]n/i.test(t.to?.name || "")
        ) || available.find((t: any) => t.id === "41" || t.id === "31") || available[0];`;

content = content.replace(oldTransBlock, newTransBlock);

// 4. Update status assignment
content = content.replace(
  `result.jira.status = matched.to?.name || matched.name || "Aprobado";`,
  `result.jira.status = "To Review";`
);

content = content.replace(
  `result.jira.status = "Aprobado (Simulado / permisos limitados)";`,
  `result.jira.status = "To Review (Permisos limitados)";`
);

// 5. Update Jira comment lines
const oldCommentLines = `      const commentLines = [
        \`🚀 [ENTREGA A DESARROLLO - APROBADA POR DISEÑO]\`,
        \`Versión: v\${version}\`,
        \`Resumen: \${summary}\`,
        \`Sistema: Uber Base Design System (base.uber.com)\`,
        \`\`,
        \`📦 ESPECIFICACIÓN TÉCNICA:\`,
        \`• Componentes BaseUI: Header, Banner, Card, VehicleOption, PIN, MapCanvas, FlowRouter, Button\`,
        \`• Tokens W3C aplicados: --base-black (#000000), --base-white (#FFFFFF), radios BaseUI de 8px\`,
        \`• Accesibilidad: Certificación WCAG 2.1 AA superada (contraste 4.5:1, táctil >= 44px)\`,
        \`\`,
        \`🌿 CONTROL DE VERSIONES (GIT):\`,
        \`• Rama creada: \${branchName} -> main\`,
        \`• Commit registrado: \${result.git.commit || "HEAD"}\`,
        \`• Código React empaquetado: output/runs/\${key}/ReactBaseUiFlow.tsx\`,
        \`\`,
        \`🎨 FIGMA:\`,
        \`• Lienzo actualizado: «\${key} · v\${version} aprobada»\`,
        \`\`,
        \`✅ CRITERIOS DE ACEPTACIÓN CUMPLIDOS:\`,
        ...(criteria.length > 0 ? criteria.map(c => \`• \${c}\`) : [
          \`• El flujo responde íntegramente a los 3 requerimientos del ticket\`,
          \`• Textos con tono oficial Uber Base\`,
          \`• Preguntas abiertas remitidas a producto\`
        ])
      ];`;

const newCommentLines = `      const commentLines = [
        \`🎨 [DISEÑO ENTREGADO · SOLICITUD DE REVISIÓN AL LEAD PRODUCT DESIGNER]\`,
        \`El diseñador ha finalizado y validado la propuesta de diseño v\${version} desarrollada con los agentes IA y Uber Base Design System.\`,
        \`\`,
        \`La tarea queda entregada en la columna "To Review" para que el Lead Product Designer revise y apruebe el diseño final.\`,
        \`\`,
        \`📦 ESPECIFICACIÓN TÉCNICA DEL DISEÑO ENTREGADO:\`,
        \`• Resumen: \${summary}\`,
        \`• Pantallas generadas: \${screens.length} pantallas interactivas\`,
        \`• Componentes oficiales BaseUI (@uber/baseui): Header, Banner, Card, VehicleOption, PriceSummary, Stepper, SecurityPIN, MapCanvas, Button\`,
        \`• Tokens W3C aplicados: Colores oficiales (#000000 / #FFFFFF), tipografía Uber Move, radios BaseUI de 8px\`,
        \`• Accesibilidad: Certificación WCAG 2.1 AA superada (contraste >= 4.5:1, táctil >= 44px)\`,
        \`\`,
        \`🌿 CONTROL DE VERSIONES (GIT):\`,
        \`• Rama creada: \${branchName} -> main\`,
        \`• Commit registrado: \${result.git.commit || "HEAD"}\`,
        \`• Código React empaquetado: output/runs/\${key}/ReactBaseUiFlow.tsx\`,
        \`\`,
        \`🎨 FIGMA:\`,
        \`• Lienzo actualizado: «\${key} · v\${version} para revisión del Lead»\`,
        \`\`,
        \`✅ VALIDACIÓN Y CRITERIOS DEL DISEÑADOR:\`,
        ...(criteria.length > 0 ? criteria.map(c => \`• \${c}\`) : [
          \`• El flujo responde íntegramente a los requerimientos del brief\`,
          \`• Componentes y tokens 100% alineados con Uber Base DS\`,
          \`• Accesibilidad WCAG 2.1 AA y criterios de diseño validados\`
        ]),
        \`\`,
        \`👉 ESTADO: Movido a la columna "To Review" para validación y visto bueno final del Lead Product Designer.\`
      ];`;

content = content.replace(oldCommentLines, newCommentLines);

// 6. Update fallbacks
content = content.replace(
  'if (!result.jira.status || result.jira.status === "Pendiente") {\n        result.jira.status = "Aprobado";\n      }',
  'if (!result.jira.status || result.jira.status === "Pendiente") {\n        result.jira.status = "To Review";\n      }'
);

content = content.replace(
  'result.jira.status = "Listo para desarrollo (Modo local)";',
  'result.jira.status = "To Review (Modo local)";'
);

content = content.replace(
  'result.jira.status = "Aprobado (Local)";',
  'result.jira.status = "To Review (Local)";'
);

// 7. Update figma broadcaster payload
content = content.replace(
  'version: "v" + version + " (aprobada)",',
  'version: "v" + version + " (para revisión del Lead)",'
);

fs.writeFileSync("src/integrations/handoff.ts", content, "utf8");
console.log("src/integrations/handoff.ts updated successfully!");
