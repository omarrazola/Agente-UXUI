/**
 * Repara cadenas JSON que han sido cortadas o tienen llaves/corchetes desbalanceados
 * (frecuente en respuestas de modelos de lenguaje cuando alcanzan límites de tokens).
 */
function repairUnclosedJson(str: string): string | null {
  const firstBrace = str.indexOf("{");
  if (firstBrace === -1) return null;

  let text = str.slice(firstBrace);
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") openBraces++;
      else if (ch === "}") openBraces = Math.max(0, openBraces - 1);
      else if (ch === "[") openBrackets++;
      else if (ch === "]") openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  // Si se cortó en mitad de una cadena, cerrar comillas
  if (inString) text += '"';
  while (openBrackets > 0) {
    text += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    text += "}";
    openBraces--;
  }

  return text;
}

/**
 * Extrae un objeto JSON de la respuesta de un agente o API externa.
 * Acepta JSON puro, bloques ```json ... ```, subcadenas delimitadas por llaves
 * y realiza autoreparación si el JSON quedó truncado.
 */
export function extractJson<T = Record<string, unknown>>(text: string): T {
  const trimmed = text.trim();
  const attempts: string[] = [trimmed];

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) attempts.push(fence[1].trim());

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last > first) {
    attempts.push(text.slice(first, last + 1));
  }

  // 1. Intentos de parseo estándar
  for (const candidate of attempts) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === "object") return value as T;
    } catch {
      // Continuar con siguiente candidato
    }
  }

  // 2. Intento con auto-reparación de JSON truncado
  const repaired = repairUnclosedJson(trimmed);
  if (repaired) {
    try {
      const value = JSON.parse(repaired);
      if (value && typeof value === "object") return value as T;
    } catch {
      // Fallo definitivo
    }
  }

  throw new Error("La respuesta del agente no contiene JSON válido.");
}

/** Convierte el formato de documento de Atlassian (ADF) o un string en texto plano. */
export function adfToText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(adfToText).join("");
  if (typeof value === "object") {
    const node = value as { type?: string; text?: string; content?: unknown[] };
    if (node.type === "text") return node.text ?? "";
    const inner = adfToText(node.content ?? []);
    const block = ["paragraph", "heading", "listItem", "blockquote", "codeBlock"].includes(node.type ?? "");
    const bullet = node.type === "listItem" ? "- " : "";
    return block ? `${bullet}${inner.trim()}\n` : inner;
  }
  return "";
}
