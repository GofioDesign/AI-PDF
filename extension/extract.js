// Chats de IA → Vista limpia + PDF — extractor
// Se inyecta en la pestaña al pulsar el icono. El valor final (una promesa)
// es lo que recibe el service worker.
(async () => {
  'use strict';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const host = location.hostname.replace(/^www\./, '');

  // ---------------------------------------------------------------------------
  // Adaptadores por sitio. `items` devuelve los nodos de mensaje en orden;
  // `role` dice si es del usuario o de la IA; `content` elige el nodo a copiar.
  // ---------------------------------------------------------------------------
  const ADAPTERS = [
    {
      name: 'ChatGPT',
      match: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/,
      selector: '[data-user-message-bubble], [data-response-body], [data-message-author-role]',
      role: (el) =>
        el.matches('[data-user-message-bubble], [data-message-author-role="user"]') ? 'user' : 'assistant',
      title: (t) => t.replace(/\s*[-|–]\s*ChatGPT\s*$/i, '').replace(/^ChatGPT\s*[-|–]\s*/i, '')
    },
    {
      name: 'Claude',
      match: /(^|\.)claude\.ai$/,
      selector: '[data-testid="user-message"], [data-testid="assistant-message"], .font-claude-message, .font-claude-response',
      role: (el) => (el.matches('[data-testid="user-message"]') ? 'user' : 'assistant'),
      title: (t) => t.replace(/\s*[-|–]\s*Claude\s*$/i, '')
    },
    {
      name: 'Gemini',
      match: /(^|\.)gemini\.google\.com$/,
      selector: 'user-query, model-response',
      role: (el) => (el.tagName === 'USER-QUERY' ? 'user' : 'assistant'),
      content: (el) =>
        el.tagName === 'USER-QUERY'
          ? el.querySelector('.query-text') || el
          : el.querySelector('message-content') || el,
      title: (t) => t.replace(/\s*[-|–]\s*(Google\s+)?Gemini\s*$/i, '')
    },
    {
      name: 'Copilot',
      match: /(^|\.)copilot\.microsoft\.com$/,
      selector: '[data-content="user-message"], [data-content="ai-message"]',
      role: (el) => (el.dataset.content === 'user-message' ? 'user' : 'assistant')
    },
    {
      name: 'Perplexity',
      match: /(^|\.)perplexity\.ai$/,
      selector: '[class*="group/query"], h1[class*="query"], [id^="markdown-content"], .prose',
      role: (el) => (el.matches('[class*="group/query"], h1') ? 'user' : 'assistant')
    },
    {
      name: 'DeepSeek',
      match: /(^|\.)chat\.deepseek\.com$/,
      selector: '.ds-message, .ds-markdown',
      role: (el) => (el.querySelector('.ds-markdown') || el.matches('.ds-markdown') ? 'assistant' : 'user')
    },
    {
      name: 'Grok',
      match: /(^|\.)grok\.com$|(^|\.)x\.com$/,
      selector: '.message-bubble',
      role: (el) => (el.closest('[class*="items-end"]') ? 'user' : 'assistant')
    },
    {
      name: 'Le Chat',
      match: /(^|\.)chat\.mistral\.ai$/,
      selector: '[data-message-author-role], [data-message-part-type="answer"]',
      role: (el) => (el.getAttribute('data-message-author-role') === 'user' ? 'user' : 'assistant')
    },
    {
      // Cualquier web que use el atributo estándar de muchas interfaces de chat
      name: 'Chat',
      match: () => !!document.querySelector('[data-message-author-role]'),
      selector: '[data-message-author-role]',
      role: (el) => (el.getAttribute('data-message-author-role') === 'user' ? 'user' : 'assistant')
    }
  ];

  const adapter = ADAPTERS.find((a) =>
    typeof a.match === 'function' ? a.match() : a.match.test(host)
  );

  // ---------------------------------------------------------------------------
  // Limpieza de un nodo: quita la interfaz, conserva texto, código, fórmulas,
  // tablas, imágenes y enlaces.
  // ---------------------------------------------------------------------------
  const REMOVE = [
    'script', 'style', 'noscript', 'template', 'iframe', 'object', 'embed',
    'button', 'textarea', 'input', 'select', 'form', 'nav', 'dialog',
    '[role="button"]:not(:has(p, pre, table, img))',
    '.sr-only', '[data-markdown-copy="exclude"]', 'h3.sr-only', 'h4[data-conversation-role]',
    '[data-testid*="action"]', '[data-testid*="copy"]', '[data-testid*="feedback"]',
    '[class*="copy-button"]', '[aria-label*="Copy" i]', '[aria-label*="Copiar" i]',
    'message-actions', 'mat-icon', '.cdk-visually-hidden', 'source-footnote', 'sources-carousel'
  ].join(',');

  function codeText(pre) {
    const lines = pre.querySelectorAll('.cm-line');
    if (lines.length) return [...lines].map((l) => l.textContent).join('\n');
    const code = pre.querySelector('code') || pre;
    const txt = code.innerText || code.textContent || '';
    return txt.replace(/\n$/, '');
  }

  function codeLang(pre) {
    const withClass = [pre, pre.querySelector('code'), pre.parentElement].find(
      (n) => n && /(?:^|\s)(?:language|lang)-([\w+#-]+)/.test(n.className || '')
    );
    if (withClass) return withClass.className.match(/(?:^|\s)(?:language|lang)-([\w+#-]+)/)[1];
    const dl = pre.closest('[data-language]')?.getAttribute('data-language');
    if (dl) return dl;
    // Cabecera con el nombre del lenguaje (ChatGPT, Claude, Gemini…)
    let box = pre.parentElement;
    for (let i = 0; i < 4 && box; i++, box = box.parentElement) {
      const label = [...box.querySelectorAll('span, div')].find(
        (n) => n.childElementCount === 0 && !pre.contains(n) &&
          /^[A-Za-z][\w+#.-]{0,15}$/.test(n.textContent.trim())
      );
      if (label) return label.textContent.trim().toLowerCase();
    }
    return '';
  }

  function cleanNode(source) {
    // Datos que hay que leer del nodo original (renderizado) antes de clonar
    const origPres = [...source.querySelectorAll('pre')];
    const codes = origPres.map((p) => ({ text: codeText(p), lang: codeLang(p) }));
    const origImgs = [...source.querySelectorAll('img')];
    const imgs = origImgs.map((img) => ({
      src: img.currentSrc || img.src,
      small: (img.naturalWidth && img.naturalWidth < 28) || (img.width && img.width < 28)
    }));

    const node = source.cloneNode(true);

    // Código: sustituir por un <pre><code> limpio
    [...node.querySelectorAll('pre')].forEach((pre, i) => {
      const info = codes[i];
      if (!info) return;
      const clean = document.createElement('pre');
      const code = document.createElement('code');
      if (info.lang) clean.setAttribute('data-lang', info.lang);
      code.textContent = info.text;
      clean.appendChild(code);
      // Si el <pre> está dentro de una caja con cabecera/botones, reemplazar la caja
      let target = pre;
      const box = pre.parentElement;
      if (box && box !== node && box.querySelectorAll('pre').length === 1 &&
          box.textContent.trim().length - pre.textContent.trim().length < 40) {
        target = box;
        const box2 = box.parentElement;
        if (box2 && box2 !== node && box2.querySelectorAll('pre').length === 1 &&
            box2.textContent.trim().length - pre.textContent.trim().length < 40) target = box2;
      }
      target.replaceWith(clean);
    });

    // Imágenes: rutas absolutas, quitar iconos
    [...node.querySelectorAll('img')].forEach((img, i) => {
      const info = imgs[i];
      if (!info || info.small || !info.src || info.src.startsWith('data:image/svg')) { img.remove(); return; }
      img.setAttribute('src', info.src);
      img.removeAttribute('srcset');
    });

    // Fórmulas KaTeX/MathJax: quedarse con el MathML que Chrome sabe pintar
    node.querySelectorAll('.katex').forEach((k) => {
      const math = k.querySelector('.katex-mathml math, math');
      if (math) {
        const block = !!k.closest('.katex-display');
        if (block) math.setAttribute('display', 'block');
        (k.closest('.katex-display') || k).replaceWith(math);
      }
    });
    node.querySelectorAll('mjx-container').forEach((m) => {
      const math = m.querySelector('mjx-assistive-mml math');
      if (math) m.replaceWith(math);
    });

    node.querySelectorAll(REMOVE).forEach((n) => n.remove());
    node.querySelectorAll('svg').forEach((n) => n.remove());

    // Enlaces absolutos
    node.querySelectorAll('a[href]').forEach((a) => {
      try { a.setAttribute('href', new URL(a.getAttribute('href'), location.href).href); } catch {}
    });

    return node.innerHTML.trim();
  }

  // ---------------------------------------------------------------------------
  // Recorrido de la conversación (algunas webs cargan mensajes al hacer scroll)
  // ---------------------------------------------------------------------------
  function scrollParent(el) {
    for (let n = el?.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 10) return n;
    }
    return document.scrollingElement;
  }

  function currentItems() {
    const all = [...document.querySelectorAll(adapter.selector)];
    // quitar coincidencias anidadas
    return all.filter((el) => !all.some((o) => o !== el && o.contains(el)));
  }

  function keyFor(el, role, text) {
    const turn = el.closest('[data-turn-key]')?.getAttribute('data-turn-key') ||
      el.closest('[data-message-id]')?.getAttribute('data-message-id') || '';
    let h = 0;
    for (let i = 0; i < Math.min(text.length, 400); i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return `${turn}|${role}|${text.length}|${h}`;
  }

  async function collect() {
    const first = currentItems()[0];
    if (!first) return [];
    const scroller = scrollParent(first);
    const startTop = scroller.scrollTop;

    // 1. Subir hasta arriba para que carguen los mensajes antiguos
    let lastHeight = -1, stable = 0;
    for (let i = 0; i < 40 && stable < 2; i++) {
      scroller.scrollTop = 0;
      await sleep(600);
      const h = scroller.scrollHeight;
      stable = h === lastHeight ? stable + 1 : 0;
      lastHeight = h;
    }

    // 2. Bajar por tramos recogiendo los mensajes (por si se desmontan)
    const seen = new Map();
    const grab = () => {
      for (const el of currentItems()) {
        const role = adapter.role(el);
        const src = adapter.content ? adapter.content(el) : el;
        const text = (src.textContent || '').trim();
        if (!text && !src.querySelector('img')) continue;
        const key = keyFor(el, role, text);
        if (!seen.has(key)) seen.set(key, { role, html: cleanNode(src) });
      }
    };
    const step = Math.max(300, scroller.clientHeight * 0.8);
    for (let i = 0; i < 400; i++) {
      grab();
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 5) break;
      scroller.scrollTop += step;
      await sleep(250);
    }
    grab();

    scroller.scrollTop = startTop;
    return [...seen.values()].filter((m) => m.html);
  }

  // ---------------------------------------------------------------------------
  // Modo principal
  // ---------------------------------------------------------------------------
  const base = {
    url: location.href,
    site: adapter?.name || host,
    date: new Date().toISOString(),
    lang: document.documentElement.lang || navigator.language
  };
  const rawTitle = document.title || host;

  // a) Texto seleccionado
  const sel = window.getSelection();
  if (sel && sel.rangeCount && sel.toString().trim().length > 20) {
    const wrap = document.createElement('div');
    for (let i = 0; i < sel.rangeCount; i++) wrap.appendChild(sel.getRangeAt(i).cloneContents());
    document.body.appendChild(wrap);
    wrap.style.cssText = 'position:fixed;left:-99999px;top:0;';
    const html = cleanNode(wrap);
    wrap.remove();
    return { ...base, mode: 'selection', title: rawTitle, messages: [{ role: 'content', html }] };
  }

  // b) Chat de IA reconocido
  if (adapter) {
    try {
      const messages = await collect();
      if (messages.length) {
        const title = (adapter.title ? adapter.title(rawTitle) : rawTitle).trim() || rawTitle;
        return { ...base, mode: 'chat', title, messages };
      }
    } catch (err) {
      console.warn('[IA → PDF]', err);
    }
  }

  // c) Cualquier otra página: contenido principal
  const main = document.querySelector('main article, article, main, [role="main"]') || document.body;
  const wrap = main.cloneNode(true);
  wrap.querySelectorAll('header, footer, aside, nav, [role="navigation"], [role="banner"], [role="contentinfo"]').forEach((n) => n.remove());
  document.body.appendChild(wrap);
  wrap.style.cssText = 'position:fixed;left:-99999px;top:0;';
  const html = cleanNode(wrap);
  wrap.remove();
  return { ...base, mode: 'page', title: rawTitle, messages: html ? [{ role: 'content', html }] : [] };
})();
