# Albora Design Agents · UX/UI AI Studio

Sistema de agentes que acompaña al equipo de diseño UX/UI desde que llega una petición en **Jira** o **Trello** hasta que hay pantallas interactivas codificadas con componentes y tokens oficiales de **Uber Base Design System** listas para revisar y aprobar.

## Características Principales

- **Equipo de 7 agentes especializados**: Analista de brief, Agente de contexto, Arquitecto UX, Redactor UX, Agente de UI, Revisor QA y Agente de entrega.
- **Tokens y Componentes BaseUI (@uber/baseui)**: 100% tokens W3C, accesibilidad WCAG 2.1 AA y flujos sin callejones sin salida.
- **Configuración centralizada y segura en `.env`**: Todas las API Keys y configuraciones de servicios (**Google Gemini**, **Anthropic Claude**, **Jira Cloud**, **Figma**) se gestionan exclusivamente en el archivo `.env` en la raíz del proyecto. Desde la interfaz web solo se visualiza el estado y validación de las conexiones, sin exponer ni almacenar claves en el navegador.
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

### 2. Variables de entorno (.env y API Keys)

Para que el servidor y los agentes funcionen correctamente, el proyecto debe contar con un archivo `.env` en la raíz con tus API Keys (Google Gemini requerida, Jira y Figma opcionales).

#### 🤖 Cómo pedirle a Google Antigravity que cree el archivo `.env` con un prompt:
En la ventana de chat de **Google Antigravity**, simplemente escribe un prompt como el siguiente indicando tus claves:

```text
Por favor, crea el archivo .env en la raíz del proyecto basándote en .env.example con mis siguientes API keys y configuración:

LLM_PROVIDER=gemini
GEMINI_API_KEY=tu_clave_de_gemini_aqui
GEMINI_MODEL=gemini-3.5-flash-lite

# Anthropic Claude (Opcional)
ANTHROPIC_API_KEY=

# Jira Cloud (Opcional)
JIRA_BASE_URL=https://tu-empresa.atlassian.net
JIRA_EMAIL=tu-email@empresa.com
JIRA_API_TOKEN=tu_api_token_de_atlassian
JIRA_PROJECT_KEY=KAN

# Figma (Opcional)
FIGMA_ACCESS_TOKEN=tu_token_de_figma_aqui
FIGMA_FILE_KEY=dcKVRyGjsYiK3Cl1iBHeXc
FIGMA_FILE_URL=https://www.figma.com/design/dcKVRyGjsYiK3Cl1iBHeXc/Untitled?node-id=0-1

DRY_RUN=false
PORT=8787
```

Antigravity generará el archivo automáticamente en la raíz del proyecto.

#### Alternativa manual:
```bash
cp .env.example .env
```
Y edita `.env` agregando tu `GEMINI_API_KEY` (gratuita en [Google AI Studio](https://aistudio.google.com/app/api-keys)).

### 3. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:8787](http://localhost:8787) en tu navegador.

---

## Comprobación de Estado desde la Web

El botón **🔑 API Keys (OK)** de la cabecera te permite inspeccionar en tiempo real qué servicios están activos desde tu archivo `.env`:
1. **Google Gemini**: Detecta si `GEMINI_API_KEY` está configurada y permite probar la conexión.
2. **Jira Cloud**: Detecta URL, usuario y token de Atlassian.
3. **Figma**: Detecta el Personal Access Token de sincronización con el lienzo.

Cada servicio incluye un botón **⚡ Probar conexión** que valida las credenciales configuradas en el servidor sin exponer claves.

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
