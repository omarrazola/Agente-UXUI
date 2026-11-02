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
 * Extrae credenciales enviadas desde el navegador del usuario (headers HTTP o payload).
 * Si el usuario no envía claves, utiliza las variables de entorno de fallback del servidor (si existen).
 */
export function extractCredentials(req: Request): RequestCredentials {
  const getHeader = (name: string): string | undefined => {
    const val = req.headers[name.toLowerCase()];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
    return undefined;
  };

  const body = (req.body && typeof req.body === "object") ? req.body : {};

  // LLM
  const rawProvider = getHeader("x-llm-provider") || body.llmProvider;
  const geminiApiKey = getHeader("x-gemini-api-key") || body.geminiApiKey || config.geminiApiKey;
  const anthropicApiKey = getHeader("x-anthropic-api-key") || body.anthropicApiKey || config.anthropicApiKey;
  const geminiModel = getHeader("x-gemini-model") || body.geminiModel || config.geminiModel;
  const claudeModel = getHeader("x-claude-model") || body.claudeModel || config.model;

  let llmProvider: "gemini" | "anthropic" | "mock" | undefined;
  if (rawProvider === "gemini" || rawProvider === "anthropic" || rawProvider === "mock") {
    llmProvider = rawProvider;
  } else if (geminiApiKey) {
    llmProvider = "gemini";
  } else if (anthropicApiKey) {
    llmProvider = "anthropic";
  } else {
    llmProvider = config.provider;
  }

  // Jira
  const jiraBaseUrl = getHeader("x-jira-url") || body.jiraBaseUrl || config.jira.baseUrl;
  const jiraEmail = getHeader("x-jira-email") || body.jiraEmail || config.jira.email;
  const jiraApiToken = getHeader("x-jira-token") || body.jiraApiToken || config.jira.apiToken;
  const jiraProjectKey = getHeader("x-jira-project") || body.jiraProjectKey || config.jira.projectKey;

  // Trello
  const trelloApiKey = getHeader("x-trello-key") || body.trelloApiKey || config.trello.apiKey;
  const trelloToken = getHeader("x-trello-token") || body.trelloToken || config.trello.token;

  // Figma
  const figmaAccessToken = getHeader("x-figma-token") || body.figmaToken || body.figmaAccessToken || config.figma.accessToken;
  const figmaFileKey = getHeader("x-figma-file-key") || body.figmaFileKey || config.figma.fileKey;
  const figmaFileUrl = getHeader("x-figma-file-url") || body.figmaFileUrl || config.figma.fileUrl;

  return {
    llmProvider,
    geminiApiKey,
    geminiModel,
    anthropicApiKey,
    claudeModel,
    jira: {
      baseUrl: jiraBaseUrl ? jiraBaseUrl.replace(/\/$/, "") : undefined,
      email: jiraEmail,
      apiToken: jiraApiToken,
      projectKey: jiraProjectKey || "KAN",
    },
    trello: {
      apiKey: trelloApiKey,
      token: trelloToken,
    },
    figma: {
      accessToken: figmaAccessToken,
      fileKey: figmaFileKey,
      fileUrl: figmaFileUrl,
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
