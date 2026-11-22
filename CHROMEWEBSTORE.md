# Chrome Web Store — IA → PDF

> Última actualización: 2026-11-22 · Versión 2.0.0
> Elemento existente: `debjfadjodahfmiabgdclllhgoggaiap` (antes «ChatGPT → Vista limpia + impresión», v1.5.1)

**Cómo subirla:** en la consola de desarrollador abre el elemento existente → **Package → Upload new package** → `dist/ai-pdf-2.0.0.zip`. No crees un elemento nuevo, para conservar usuarios, valoraciones e ID.

---

## 1. Store listing

**Nombre** (sale del manifest, traducido a 15 idiomas: «IA → PDF», «AI → PDF», «KI → PDF», «YZ → PDF», «ИИ → PDF»)
```
IA → PDF
```

**Descripción breve** (sale del manifest)
```
Imprime o guarda en PDF tus chats de ChatGPT, Claude, Gemini, Copilot y otras IAs en una vista limpia, con código resaltado.
```

**Descripción** — usar `store/descripcion-combinada.txt` (todos los idiomas) o `store/descripciones/<idioma>.txt`. No volver a poner listas de nombres de IAs: Google lo considera keyword stuffing (rechazo «Yellow Argon»). Texto antiguo, solo como referencia:
```
Guarda en PDF o imprime tus conversaciones con cualquier IA en una vista limpia y fácil de leer: sin menús, botones ni barras laterales.

Antes funcionaba solo con ChatGPT; desde la versión 2.0 funciona con las principales IAs y con cualquier página web.

FUNCIONA CON
• ChatGPT
• Claude
• Gemini
• Microsoft Copilot
• Perplexity
• DeepSeek
• Grok
• Le Chat (Mistral)
• Cualquier otra web: imprime el contenido principal de la página.
• Texto seleccionado: si seleccionas una parte, imprime solo esa parte.

QUÉ OBTIENES
• Tus preguntas y las respuestas, en orden y bien separadas.
• Código con resaltado de sintaxis y el nombre del lenguaje.
• Tablas, listas, enlaces, imágenes y fórmulas matemáticas.
• Conversaciones completas, también las largas que la web carga a trozos.
• Un PDF siempre claro y legible, aunque uses el tema oscuro.

EN TU IDIOMA
Disponible en español, inglés, francés, alemán, italiano, portugués (Brasil y Portugal), neerlandés, polaco, turco, ruso, japonés, coreano y chino (simplificado y tradicional).

AJUSTES ANTES DE IMPRIMIR
• Edita el título del documento.
• Oculta tus mensajes y deja solo las respuestas.
• Muestra u oculta quién habla en cada mensaje.
• Modo compacto y tres tamaños de letra.
• Tema oscuro para leer en pantalla.
• Crédito discreto al pie del PDF, que puedes quitar con una casilla.

CÓMO SE USA
0. Fija la extensión en la barra (icono de la pieza de puzle → chincheta). Al instalarla verás una pantalla que te lo explica.
1. Abre la conversación.
2. Pulsa el icono de la extensión (o Alt+Shift+P).
3. Revisa la vista limpia que se abre en una pestaña nueva.
4. Pulsa «Imprimir / Guardar PDF» y elige «Guardar como PDF».

PRIVACIDAD
La extensión solo lee la pestaña cuando tú pulsas el icono. Todo se procesa en tu navegador: no envía tus conversaciones a ningún servidor, no usa analítica ni servicios de terceros. Solo guarda en tu navegador tus preferencias y un contador de usos para invitarte, de vez en cuando, a valorarla o a donar (siempre voluntario).

CÓDIGO ABIERTO
https://github.com/GofioDesign/AI-PDF

Si alguna IA deja de verse bien (cambian su web a menudo), avísanos en la página de issues y lo arreglamos.

Desarrollado por Gofio Design. Proyecto independiente, sin relación con OpenAI, Anthropic, Google, Microsoft ni el resto de servicios mencionados.

————————————————————

ENGLISH

Print or save as PDF your conversations with any AI in a clean, readable view — no menus, buttons or sidebars.

Works with ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, DeepSeek, Grok and Le Chat, plus any other website (prints the main content) or just the text you select.

• Your prompts and the answers, in order.
• Syntax-highlighted code, tables, images and math formulas.
• Full conversations, including long ones loaded in chunks.
• Edit the title, hide your prompts, compact mode, three font sizes.

How to use: open the chat, click the extension icon (or Alt+Shift+P), then "Print / Save PDF".

Privacy: it only reads the tab when you click the icon. Everything is processed in your browser; nothing is sent anywhere.

Open source: https://github.com/GofioDesign/AI-PDF
Independent project, not affiliated with OpenAI, Anthropic, Google, Microsoft or the other services mentioned.
```

**Categoría:** Productividad (Productivity) — o Herramientas (Tools), la que tuviera la v1
**Idioma:** Español

**Imágenes**
- Icono 128×128 → `extension/icons/icon-128.png`
- Capturas 1280×800 → `store/screenshot-3.png` (primera), `store/screenshot-1.png`, `store/screenshot-2.png`
- Mosaico pequeño 440×280 → `store/promo-tile-440x280.png`

**Homepage URL:** https://github.com/GofioDesign/AI-PDF
**Support URL:** https://github.com/GofioDesign/AI-PDF/issues

---

## 2. Privacy practices

**Single purpose**
```
Creates a clean, printable view of the AI chat conversation (or other page content) in the current tab so the user can print it or save it as PDF.
```

**activeTab justification**
```
Gives temporary access to the current tab only when the user clicks the extension icon or presses the keyboard shortcut, so the extension can read the conversation shown on that page and build the print view. It never accesses tabs without that explicit user action.
```

**scripting justification**
```
Used together with activeTab to run the extraction script in the current tab after the user clicks the icon. The script collects the conversation's text, code blocks, tables and images, removes buttons and menus, and returns it to open the clean print view. All code is packaged in the extension; no remote code is executed.
```

**storage justification**
```
Stores locally the user's print-view preferences (font size, compact mode, footer credit, show/hide prompts and labels), the install date and a local usage counter (used only to occasionally show an optional rating invitation and, at most once a year, an optional donation invitation; never transmitted), and temporarily holds the extracted conversation in session storage while the print view tab opens. Session data is cleared automatically when the browser closes.
```

**Host permissions:** ninguno (no aparece este campo).

**Remote code:** No, I am not using remote code.

**Data usage:** no marcar ninguna categoría · marcar las tres certificaciones.

**Privacy policy URL**
```
https://github.com/GofioDesign/AI-PDF/blob/main/PRIVACY.md
```

---

## Historial

| Versión | Fecha | Cambios | Estado |
|---|---|---|---|
| 2.0.0 | 2026-11-22 | Rechazada por «Yellow Argon» (lista de nombres de IAs en la descripción = keyword stuffing). Corregido: nombres solo en una frase (ChatGPT, Claude o Gemini) y sin lista de empresas. Reenviada. |
| 2.0.0 (1.er envío) | 2026-11-22 | Nombre «IA → PDF»; 15 idiomas; crédito opcional al pie; invitaciones locales a valorar (cada 5 usos) y donar (1 vez al año). Pantalla de bienvenida (es/en) al instalar y al actualizar desde la 1.x; icono nuevo. Reescritura: soporte para varias IAs, cualquier web y selección; recorre chats largos; opciones de vista; sin permisos de host | Borrador |
| 1.5.1 | 2025-09-29 | Versión anterior (solo ChatGPT) | Publicada |
