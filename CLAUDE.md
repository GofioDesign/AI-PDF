# IA → PDF — contexto para Claude

Extensión de Chrome (Manifest V3) de **Gofio Design** (Juan Alberto) para **imprimir o guardar en PDF conversaciones con IAs** en una vista limpia: sin menús, botones ni barras laterales, con código resaltado, tablas, fórmulas e imágenes.

- Nombre traducido según idioma: «IA → PDF», «AI → PDF», «KI → PDF», «YZ → PDF», «ИИ → PDF»…
- Es la **2.0.0 del ítem existente** `debjfadjodahfmiabgdclllhgoggaiap` de la Chrome Web Store (antes «ChatGPT → Vista limpia + impresión», v1.5.1). Nunca crear un ítem nuevo: se pierden usuarios, valoraciones e ID, y los duplicados están prohibidos.
- **Estado:** la 2.0.0 fue rechazada una vez por «keyword stuffing» (Yellow Argon), se corrigió y **Google la aprobó** (22-11-2026).
- Repo: https://github.com/GofioDesign/AI-PDF (antes `ai-chat-print`). Zip en `releases/ai-pdf-2.0.0.zip`.
- El usuario habla en **español**; responde en español.

## Estructura

```
extension/
  manifest.json     permisos: activeTab + scripting + storage (sin permisos de host). Atajo Alt+Shift+P
  background.js     al pulsar el icono inyecta extract.js en la pestaña, guarda el resultado en
                    chrome.storage.session (doc_<id>) y abre print/print.html?id=<id> al lado.
                    Si no encuentra mensajes: insignia «!» roja 4 s. Bienvenida al instalar o al actualizar desde 1.x.
  extract.js        se inyecta en la página; su valor final (una promesa) es lo que recibe el service worker
  print/            vista de impresión: print.html|css|js (saneado propio del HTML, opciones, avisos)
  lib/              highlight.js (+ licencia) y su tema github
  welcome/          bienvenida: cómo fijar el icono y usarlo
  _locales/         15 idiomas, GENERADOS por tools/locales.py
  icons/            «opción C» elegida por el usuario
tools/
  locales.py        FUENTE ÚNICA de los textos de los 15 idiomas → `python3 tools/locales.py` regenera _locales
  store_descriptions.py / store_combined.py   generan las descripciones de la tienda por idioma y la combinada (<16 000)
store/              capturas, mosaico, descripciones (descripciones/<idioma>.txt, descripcion-combinada.txt)
build.sh            genera dist/ai-pdf-<versión>.zip (archivos en la raíz del zip)
CHROMEWEBSTORE.md   campos de la ficha y de privacidad
```

Para cambiar un texto: edítalo en `tools/locales.py` (los 15 idiomas) y ejecuta el script; **no edites los messages.json a mano**.

## Cómo extrae (extract.js)

- `ADAPTERS`: uno por sitio con `match` (regex de host o función), `selector` de los nodos de mensaje, `role(el)` → `user`/`assistant`, `content(el)` opcional y `title(t)` para limpiar el título de la pestaña.
  - Probados a fondo: **ChatGPT, Claude (incluidas conversaciones largas) y Gemini**.
  - Con adaptador pero sin probar a fondo: Copilot, Perplexity, DeepSeek, Grok, Le Chat.
  - Genérico: cualquier web con `[data-message-author-role]`.
- **Sin adaptador** imprime el contenido principal (`main article, article, main, [role=main]` o `body`). **Con texto seleccionado** imprime solo la selección, en cualquier web.
- Recorre la conversación entera haciendo scroll en su contenedor (`scrollParent`) para cargar los chats que llegan a trozos, deduplica mensajes y vuelve a la posición original.
- `cleanNode` quita la interfaz (`REMOVE`: botones, copiar, feedback, iconos…) y conserva texto, código (también CodeMirror `.cm-line`), fórmulas, tablas, imágenes y enlaces.
- En print.js todo el HTML pasa por `sanitize()` con listas blancas de etiquetas y atributos.

## Vista de impresión

- Opciones (guardadas en `storage`): mostrar mis mensajes, quién habla, compacto, tema oscuro en pantalla, tamaño de letra y **crédito al pie «Generado con IA → PDF · gofiodesign.eu», activado por defecto**.
- Título editable con un clic.
- Enlace «Más extensiones · Apoya el proyecto» a la página de extensiones de gofiodesign.eu en el idioma del usuario (`moreUrl`; donaciones en paypal.me/gofiodesign).
- Avisos (`maybeAsk`, todo en `chrome.storage.local`):
  - Valoración **cada 5 usos**; un uso = abrir la vista de impresión.
  - Desde la 3.ª vez sale «No volver a mostrar».
  - Donación: modal como mucho una vez al año desde la instalación.
  - Nunca los dos avisos a la vez.

## Preferencias y decisiones del usuario

- Se descartó una versión «pro» o con marca de agua desbloqueada al valorar: **incentivar valoraciones está prohibido** en la tienda.
- La descripción dice que funciona en cualquier web (imprime el contenido principal). El usuario pidió **no cambiar** esa frase («no, el cambio no»).
- Cambios en la web gofiodesign.eu: siempre por PR en `GofioDesign/GofioDesign.github.io` (páginas de extensiones en ES/EN/DE/FR).

## Chrome Web Store: normas que ya nos han tumbado algo

- **Keyword stuffing («Yellow Argon»):** nada de listas de nombres de IAs ni de empresas. Como mucho una frase con ChatGPT, Claude o Gemini.
- Descripción breve ≤ 132 caracteres **en cada idioma**; un idioma con 133 bloqueó el envío. La descripción larga, ≤ 16 000 por idioma.
- Datos procesados solo en el navegador no cuentan como «recogidos»: en privacidad no se marca ninguna categoría.

## Cómo probar

- Inyectar `extract.js` en una conversación real desde el Chrome del usuario y revisar el resultado.
- Vista de impresión y bienvenida: playwright con `/usr/bin/google-chrome` y un stub de `chrome.*` (i18n, storage, session).

## Entorno (sesiones en la nube de Claude)

- `git push` funciona con las credenciales de `add_repo`. **`gh` no tiene token válido** y **subir etiquetas falla** por el proxy: los releases se crean desde el formulario web de GitHub, y el usuario adjunta el zip.
- Las herramientas del navegador no abren `chrome://` ni la Chrome Web Store.

## Extensión hermana

**Dezombify** (https://github.com/GofioDesign/dezombify): feed solo de quien sigues en 9 redes sociales. Comparte el sistema de avisos (valoración y donación), el enlace a gofiodesign.eu y la bienvenida. Para traducirla a 15 idiomas, usa como modelo `tools/locales.py` de este repo.

## Ideas pendientes

- Probar a fondo los adaptadores de Copilot, Perplexity, DeepSeek, Grok y Le Chat.
- Release v2.0.0 en GitHub, si aún no está creado (el formulario se preparó; falta que el usuario lo publique).
