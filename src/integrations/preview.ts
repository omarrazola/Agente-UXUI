import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import type { ScreenFile } from "../types.js";

/**
 * Escribe las pantallas de una versión en output/previews/<clave>/v<n>/,
 * copia base.css al lado y genera un índice. El servidor las sirve en /previews.
 * Devuelve la URL pública del índice.
 */
const safe = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "_");

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function writePreview(key: string, version: number, files: ScreenFile[]): Promise<string> {
  const safeKey = safe(key);
  const dir = path.join(config.paths.output, "previews", safeKey, `v${version}`);
  await mkdir(dir, { recursive: true });
  await copyFile(path.join(config.paths.designSystem, "css", "base.css"), path.join(dir, "base.css"));

  const names: string[] = [];
  for (const file of files) {
    let name = path.basename(file.path).replace(/[^A-Za-z0-9._-]/g, "-");
    if (!name.endsWith(".html")) name += ".html";
    names.push(name);
    await writeFile(path.join(dir, name), file.html);
  }

  const links = names
    .map(
      (n, i) =>
        `<li style="margin:0;"><a href="${encodeURIComponent(n)}" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--base-bg-primary,#fff);border:1px solid var(--base-border-opaque,#E2E2E2);border-radius:10px;text-decoration:none;color:var(--base-black,#000);font-weight:600;font-size:14px;transition:box-shadow .15s ease;"><span style="display:flex;align-items:center;gap:10px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--base-bg-secondary,#F6F6F6);font-size:12px;color:var(--base-content-secondary,#545454);">${i + 1}</span>${escapeHtml(n.replace(/\.html$/, ""))}</span><span style="font-size:16px;">➔</span></a></li>`
    )
    .join("\n");

  await writeFile(
    path.join(dir, "index.html"),
    `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(key)} · v${version} · Uber Base DS</title>
  <link rel="stylesheet" href="base.css">
  <style>
    body { margin:0; padding:32px 16px; background:var(--base-bg-secondary,#F6F6F6); display:flex; justify-content:center; font-family:"Uber Move Text",Inter,-apple-system,sans-serif; }
    .preview-card { width:100%; max-width:440px; background:var(--base-bg-primary,#FFFFFF); border-radius:16px; padding:28px 24px; box-shadow:0 4px 16px rgba(0,0,0,0.08); border:1px solid var(--base-border-opaque,#E2E2E2); }
    h1 { font-family:"Uber Move",Inter,sans-serif; font-size:22px; font-weight:800; margin:0 0 6px 0; color:var(--base-black,#000); }
    p { margin:0 0 20px 0; font-size:13px; color:var(--base-content-secondary,#545454); line-height:1.5; }
    ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
  </style>
</head>
<body>
  <main class="preview-card">
    <div style="display:inline-block;padding:4px 10px;border-radius:4px;background:#EBF7EE;color:#0E8345;font-size:11px;font-weight:700;margin-bottom:12px;letter-spacing:0.5px;">UBER BASE DESIGN SYSTEM</div>
    <h1>${escapeHtml(key)} · Versión ${version}</h1>
    <p>Pantallas y flujos generados con componentes y tokens oficiales de Uber Base:</p>
    <ul>
      ${links}
    </ul>
  </main>
</body>
</html>`
  );

  return `${config.publicBaseUrl}/previews/${encodeURIComponent(safeKey)}/v${version}/`;
}
