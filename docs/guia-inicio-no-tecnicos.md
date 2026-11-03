# 🐣 Guía Rápida para Probar el Agente en Local (Sin Perfil Técnico)

¡Hola! Esta guía está pensada para que **cualquier persona del equipo** (diseñadores, product managers, negocio o curiosos) pueda descargarse el proyecto, ponerlo en marcha en su propio ordenador y jugar con los agentes en **menos de 5 minutos**, sin necesidad de saber programar.

---

## 🎯 ¿Qué vas a poder hacer?

Tendrás una **consola visual en tu navegador** donde podrás:
1. Ver a un equipo de **7 agentes de Inteligencia Artificial** trabajando en cadena (analizando briefs, definiendo flujos UX, redactando textos, creando pantallas y auditando accesibilidad).
2. **Probar ideas y pedir cambios** (ejemplo: *"Añade una opción para viajar con mascotas"*, *"Cambia el botón a variante secundaria"*).
3. Ver cómo los agentes recalculan y actualizan las pantallas al instante.
4. Exportar el resultado directamente a tu Figma si eres diseñador.

---

## 🛠️ Paso 0: Lo único que necesitas instalar (1 sola vez)

Solo necesitas un programa en tu ordenador llamado **Node.js** (es el motor que hace que el agente funcione).

1. Entra en [nodejs.org](https://nodejs.org/).
2. Haz clic en el botón verde grande que dice **LTS (Recomendado para la mayoría)**.
3. Abre el archivo descargado y dale a **Siguiente / Next** a todo hasta que termine la instalación.
*(Si ya lo tenías instalado en tu equipo, puedes saltar este paso).*

---

## 📥 Paso 1: Descargar el proyecto desde GitHub

Tienes dos formas muy sencillas:

### Opción A (La más fácil, sin tocar la terminal):
1. Ve a la página del proyecto en GitHub: [github.com/omarrazola/Agent-claude](https://github.com/omarrazola/Agent-claude)
2. Haz clic en el botón verde que dice **Code** (arriba a la derecha).
3. Pulsa en **Download ZIP**.
4. Descomprime ese archivo ZIP en la carpeta que quieras (por ejemplo, en tu *Escritorio* o en *Documentos*).

---

## ⚙️ Paso 2: Preparar el agente (solo la primera vez)

1. **Abre la carpeta descomprimida.**
2. **Abre una terminal en esa carpeta:**
   - **En Windows:** Haz clic en la barra de direcciones de la carpeta (donde pone la ruta), escribe `cmd` o `powershell` y pulsa **Enter**.
   - **En Mac:** Haz clic derecho sobre la carpeta del proyecto y selecciona *"Nuevo terminal en la carpeta"*.
3. **Instala los componentes necesarios:**
   Copia y pega este comando en la ventana negra/azul y pulsa **Enter**:
   ```bash
   npm install
   ```
   *(Tardará unos 30-60 segundos en descargar lo necesario. Verás unas barras de progreso).*

4. **Crear el archivo de configuración (.env):**
   Para que la herramienta funcione necesita un archivo llamado `.env` en la carpeta raíz del proyecto con las API keys.

   🤖 **La forma más fácil: Pídeselo a Google Antigravity con un prompt**
   En el chat de Antigravity, escribe:
   ```text
   Crea el archivo .env en la raíz del proyecto a partir de .env.example con mis siguientes API keys:
   GEMINI_API_KEY=tu_clave_de_gemini
   JIRA_BASE_URL=https://tu-empresa.atlassian.net
   JIRA_EMAIL=tu-email@empresa.com
   JIRA_API_TOKEN=tu_token_jira
   ```
   ¡Y Antigravity creará el archivo por ti al instante!

   *Forma manual alternativa:*
   - En esa misma carpeta verás un archivo llamado `.env.example`.
   - Haz una copia de ese archivo y llámala `.env` (ejecuta en la terminal: `copy .env.example .env` en Windows, o `cp .env.example .env` en Mac).
   
> 💡 **¿Dónde conseguir tu clave de Inteligencia Artificial gratuita?**
> - Consigue una clave gratuita de **Google Gemini** en [aistudio.google.com/app/api-keys](https://aistudio.google.com/app/api-keys).
> - Pégala en `.env` donde dice `GEMINI_API_KEY=tu_clave_aqui`. El botón **🔑 API Keys (OK)** de la web te confirmará que está conectada.

---

## 🚀 Paso 3: ¡A jugar! Cómo arrancar el agente

En la ventana de la terminal, escribe este comando y pulsa **Enter**:

```bash
npm run dev
```

Verás un mensaje que dice algo como:
`Servidor listo en http://localhost:8787`

Ahora abre tu navegador favorito (Chrome, Edge, Safari o Firefox) y entra en:
👉 **[http://localhost:8787](http://localhost:8787)**

---

## 🎮 Cómo iterar y jugar con los agentes desde la web

Una vez dentro de la página web (`http://localhost:8787`):

1. **Lanza un diseño:**
   - Verás tarjetas de ejemplo preparadas (por ejemplo: *Reserva Uber Green con Apple Pay*).
   - Haz clic en **«Lanzar flujo de agentes»** o **«Ejecutar prueba»**.
   - Observa cómo cada agente se activa paso a paso y va aportando su parte.
2. **Revisa las pantallas generadas:**
   - Podrás ver el prototipo visual interactivo con componentes reales de Uber Base Design System.
3. **Pide cambios (Iteración):**
   - Busca la caja de texto que dice **«Pedir cambios a los agentes»** o **«Iterar diseño»**.
   - Escribe con lenguaje natural lo que quieras cambiar, como si hablaras con un compañero:
     - *"Pon el botón principal en color negro y añade un selector de propina."*
     - *"Elimina la opción de pago en efectivo y destaca Apple Pay."*
     - *"Añade un aviso indicando que el conductor llegará en 3 minutos."*
   - Pulsa **«Aplicar cambios»** y verás cómo el agente genera una nueva versión (v2, v3...) adaptando el flujo.
4. **Si usas Figma:**
   - En la tarjeta de Figma puedes pegar el link de tu archivo o pulsar **«Copiar para Figma»** para pegar los componentes directamente en tu lienzo.

---

## ⚡ Formas alternativas de probarlo

### Opción 1: Probar un cambio rápido desde la terminal
Si te gusta la terminal, puedes pedir un cambio directamente escribiendo:
```bash
npm run iterate -- ALB-482 "Pon primero la tarifa flexible"
```
Los agentes procesarán la petición y guardarán las pantallas actualizadas en la carpeta `output/previews/`.

### Opción 2: Solo ver la maqueta sin instalar nada
Si algún día solo quieres ver la interfaz y el prototipo sin arrancar ningún servidor:
- Ve a la carpeta `demo/` y haz doble clic sobre el archivo `index.html`.
- Se abrirá en tu navegador en modo catálogo interactivo.

---

## 🛑 Cómo apagar el agente y volverlo a encender

- **Para apagarlo:** Ve a la ventana de la terminal y pulsa las teclas **`Ctrl` + `C`** (o cierra la ventana).
- **Para volver a usarlo mañana:**
  1. Abre la carpeta del proyecto.
  2. Abre la terminal (`cmd` o `powershell`).
  3. Escribe `npm run dev` y entra de nuevo a `http://localhost:8787`. (¡Ya no tienes que hacer nada del Paso 0 ni 1!).

---

## ❓ Preguntas frecuentes y solución de problemas

- **Me dice: `'node'` o `'npm'` no se reconoce como un comando:**
  - Solución: Cierra la ventana de la terminal y vuelve a abrirla. Si acabas de instalar Node.js, Windows/Mac necesita que se abra una terminal nueva para reconocerlo.
- **La página `http://localhost:8787` no carga:**
  - Comprueba que la terminal sigue abierta y que pusiste `npm run dev`. Si cerraste la ventana, el agente se apagó.
- **¿Puedo romper algo del proyecto por probar?**
  - ¡Para nada! Está configurado en modo seguro (`DRY_RUN=true`), lo que significa que no modificará tickets reales ni publicará nada sin que tú lo configures expresamente. ¡Juega con total tranquilidad!
