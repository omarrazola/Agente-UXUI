# Albora Design Agents · UX/UI AI Studio

Sistema de agentes que acompaña al equipo de diseño UX/UI desde que llega una petición en **Jira** o **Trello** hasta que hay pantallas interactivas codificadas con componentes y tokens oficiales de **Uber Base Design System** listas para revisar y aprobar.

## Características Principales

- **Equipo de 7 agentes especializados**: Analista de brief, Agente de contexto, Arquitecto UX, Redactor UX, Agente de UI, Revisor QA y Agente de entrega.
- **Tokens y Componentes BaseUI (@uber/baseui)**: 100% tokens W3C, accesibilidad WCAG 2.1 AA y flujos sin callejones sin salida.
- **Modo BYOK (Bring Your Own Keys)**: Cada usuario puede ingresar sus propias claves de **Google Gemini**, **Anthropic Claude**, **Jira Cloud** o **Figma** directamente desde la interfaz web. Las claves se guardan únicamente en el `localStorage` del navegador y viajan en cabeceras cifradas por sesión, protegiendo las cuotas personales y la privacidad de cada usuario.
- **Sincronización con Figma**: Exportación de vectores de pantalla, scripts de consola para Figma y WebSocket en tiempo real.
- **Handoff a Desarrollo**: Transición de tickets en Jira hacia *To Review*, generación de especificación JSON, diagrama Mermaid y código React.

---

## Puesta en marcha rápida

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/omarrazola/Agente-UXUI.git
cd Agente-UXUI
npm install
```

### 2. Variables de entorno (Opcional si usas el panel web BYOK)

```bash
cp .env.example .env
```

> **Nota para producción:** No necesitas configurar tus claves personales en el servidor `.env` en producción. Los usuarios pueden introducir sus propias API keys directamente desde el botón **🔑 Configurar API Keys** de la barra de navegación web.

### 3. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:8787](http://localhost:8787) en tu navegador.

---

## Configuración de Claves (BYOK) desde la Web

Haz clic en el botón **🔑 Configurar API Keys** en la cabecera para configurar:
1. **Modelos de IA**:
   - **Google Gemini**: Obtén tu API Key gratuita en [Google AI Studio](https://aistudio.google.com/app/api-keys).
   - **Anthropic Claude**: En [Anthropic Console](https://console.anthropic.com/settings/keys).
2. **Jira Cloud**:
   - URL base (ej. `https://tu-empresa.atlassian.net`).
   - Email de la cuenta Atlassian.
   - API Token generado en [Atlassian Security](https://id.atlassian.com/manage-profile/security/api-tokens).
   - Clave de proyecto (`KAN`, `DES`, etc.).
3. **Figma**:
   - Personal Access Token de Figma generado en Settings.
   - URL del archivo de destino.

Cada pestaña incluye un botón **⚡ Probar conexión** para validar tus credenciales en tiempo real antes de utilizarlas.

---

## Documentación

- [🐣 Guía de Inicio Rápido (No técnicos)](docs/guia-inicio-no-tecnicos.md)
- [Arquitectura](docs/architecture.md)
- [Agentes y Organigrama](docs/agents.md)
- [Puesta en marcha](docs/setup.md)
- [Plan de piloto](docs/pilot-plan.md)
- [Seguridad y datos](docs/security.md)

---

## Licencia y Uso

Privado / Uso interno para aceleración de producto y diseño UX/UI.
