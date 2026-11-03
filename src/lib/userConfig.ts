import type { Request } from "express";
import { GoogleGenAI } from "@google/genai";
import { Anthropic } from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { log } from "./logger.js";

export interface RequestCredentials {
  llmProvider?: "gemini" | "anthropic" | "mock";
  geminiApiKey?: string;
  geminiModel?: string;
  anthropicApiKey?: string;
  claudeModel?: string;
  jira?: {
    baseUrl?: string;
    email?: string;
    apiToken?: string;
    projectKey?: string;
  };
  trello?: {
    apiKey?: string;
    token?: string;
  };
  figma?: {
    accessToken?: string;
    fileKey?: string;
    fileUrl?: string;
  };
}

/**
 * Las credenciales se obtienen exclusivamente desde el archivo .env del servidor (config).
 * Por seguridad e integridad del proyecto, no se permite inyectar ni configurar claves desde el cliente web.
 */
export function extractCredentials(_req?: Request): RequestCredentials {
  return {
    llmProvider: config.provider,
    geminiApiKey: config.geminiApiKey,
    geminiModel: config.geminiModel,
    anthropicApiKey: config.anthropicApiKey,
    claudeModel: config.model,
    jira: {
      baseUrl: config.jira.baseUrl ? config.jira.baseUrl.replace(/\/$/, "") : undefined,
      email: config.jira.email,
      apiToken: config.jira.apiToken,
      projectKey: config.jira.projectKey || "KAN",
    },
    trello: {
      apiKey: config.trello.apiKey,
      token: config.trello.token,
    },
    figma: {
      accessToken: config.figma.accessToken,
      fileKey: config.figma.fileKey,
      fileUrl: config.figma.fileUrl,
    },
  };
}

export async function testGemini(apiKey: string, model?: string): Promise<{ ok: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const chosenModel = model || "gemini-2.5-flash";
    const resp = await ai.models.generateContent({
      model: chosenModel,
      contents: "Responde 'OK'",
      config: { maxOutputTokens: 10 },
    });
    if (resp.text) {
      return { ok: true, message: `Conexión con Gemini (${chosenModel}) exitosa.` };
    }
    return { ok: true, message: "Conexión con Gemini exitosa." };
  } catch (err: any) {
    log.warn("[TEST] Error al probar Gemini:", err);
    return { ok: false, message: `Error en Gemini: ${err?.message || err}` };
  }
}

export async function testAnthropic(apiKey: string, model?: string): Promise<{ ok: boolean; message: string }> {
  try {
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: model || "claude-3-5-sonnet-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "Responde 'OK'" }],
    });
    return { ok: true, message: "Conexión con Anthropic Claude exitosa." };
  } catch (err: any) {
    log.warn("[TEST] Error al probar Claude:", err);
    return { ok: false, message: `Error en Claude: ${err?.message || err}` };
  }
}

export async function testJira(baseUrl: string, email: string, apiToken: string): Promise<{ ok: boolean; message: string }> {
  try {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${email}:${apiToken}`).toString("base64"),
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, message: `Jira respondió código ${res.status}: ${txt.slice(0, 150)}` };
    }
    const data = (await res.json()) as any;
    return { ok: true, message: `Conectado a Jira como ${data.displayName || data.emailAddress || email}` };
  } catch (err: any) {
    log.warn("[TEST] Error al probar Jira:", err);
    return { ok: false, message: `Error conectando a Jira: ${err?.message || err}` };
  }
}

export async function testFigma(accessToken: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("https://api.figma.com/v1/me", {
      headers: { "X-Figma-Token": accessToken },
    });
    if (!res.ok) {
      return { ok: false, message: `Figma respondió código ${res.status} (Token inválido o sin permisos)` };
    }
    const data = (await res.json()) as any;
    return { ok: true, message: `Conectado a Figma como ${data.handle || data.email || "Usuario"}` };
  } catch (err: any) {
    log.warn("[TEST] Error al probar Figma:", err);
    return { ok: false, message: `Error conectando a Figma: ${err?.message || err}` };
  }
}

export async function testTrello(apiKey: string, token: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`https://api.trello.com/1/members/me?key=${apiKey}&token=${token}`);
    if (!res.ok) {
      return { ok: false, message: `Trello respondió código ${res.status}` };
    }
    const data = (await res.json()) as any;
    return { ok: true, message: `Conectado a Trello como ${data.fullName || data.username || "Usuario"}` };
  } catch (err: any) {
    log.warn("[TEST] Error al probar Trello:", err);
    return { ok: false, message: `Error conectando a Trello: ${err?.message || err}` };
  }
}
