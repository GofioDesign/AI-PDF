// Chats de IA → Vista limpia + PDF — vista de impresión
'use strict';

const t = (key, ...subs) => chrome.i18n.getMessage(key, subs) || key;

// ---------------------------------------------------------------------------
// Saneado: solo se conservan etiquetas y atributos de contenido.
// ---------------------------------------------------------------------------
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'span', 'div', 'section', 'article',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup', 'small', 'kbd', 'abbr', 'cite', 'q',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'blockquote', 'pre', 'code', 'samp',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'a', 'img', 'figure', 'figcaption', 'picture', 'details', 'summary',
  // MathML
  'math', 'semantics', 'annotation', 'mrow', 'mi', 'mn', 'mo', 'ms', 'mtext', 'mspace', 'msub', 'msup',
  'msubsup', 'mfrac', 'msqrt', 'mroot', 'mover', 'munder', 'munderover', 'mtable', 'mtr', 'mtd',
  'mstyle', 'mpadded', 'mphantom', 'menclose', 'mfenced', 'mmultiscripts', 'mprescripts', 'none'
]);
const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'start', 'reversed', 'type', 'open',
  'data-lang', 'display', 'mathvariant', 'stretchy', 'fence', 'separator', 'lspace', 'rspace',
  'accent', 'accentunder', 'encoding', 'columnalign', 'rowalign', 'width', 'height', 'depth',
  'linethickness', 'scriptlevel', 'displaystyle', 'movablelimits', 'notation', 'minsize', 'maxsize', 'largeop', 'symmetric'
]);
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'canvas', 'video', 'audio', 'form', 'button', 'input', 'textarea', 'select', 'link', 'meta', 'noscript', 'template']);

function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); continue; }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.localName;
      if (DROP_WITH_CONTENT.has(tag)) { child.remove(); continue; }
      walk(child);
      if (!ALLOWED_TAGS.has(tag)) {
        // desenvolver: conservar los hijos
        child.replaceWith(...child.childNodes);
        continue;
      }
      for (const attr of [...child.attributes]) {
        const name = attr.name.toLowerCase();
        if (!ALLOWED_ATTRS.has(name)) { child.removeAttribute(attr.name); continue; }
        if ((name === 'href' || name === 'src') && !/^(https?:|data:image\/(png|jpe?g|gif|webp);)/i.test(attr.value)) {
          child.removeAttribute(attr.name);
        }
      }
      if (tag === 'img' && !child.getAttribute('src')) { child.remove(); continue; }
      if (tag === 'a') { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener noreferrer'); }
    }
  };
  walk(doc.body);
  // Quitar divs/spans vacíos que deja la interfaz
  doc.body.querySelectorAll('div, span, p').forEach((n) => {
    if (!n.textContent.trim() && !n.querySelector('img, math, br, hr, table')) n.remove();
  });
  return doc.body;
}

// ---------------------------------------------------------------------------
// Opciones (se recuerdan entre usos)
// ---------------------------------------------------------------------------
const OPTS = { prompts: true, labels: true, compact: false, dark: false, credit: true, font: 'normal' };

function applyOpts(o) {
  document.body.classList.toggle('no-prompts', !o.prompts);
  document.body.classList.toggle('no-labels', !o.labels);
  document.body.classList.toggle('compact', o.compact);
  document.body.classList.toggle('dark', o.dark);
  document.body.classList.toggle('no-credit', !o.credit);
  document.body.classList.remove('font-small', 'font-normal', 'font-large');
  document.body.classList.add(`font-${o.font}`);
}

async function initOpts() {
  let o = { ...OPTS };
  try { o = { ...OPTS, ...(await chrome.storage.local.get(OPTS)) }; } catch {}
  const map = { optPrompts: 'prompts', optLabels: 'labels', optCompact: 'compact', optDark: 'dark', optCredit: 'credit' };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    el.checked = o[key];
    el.addEventListener('change', async () => {
      o[key] = el.checked; applyOpts(o);
      try { await chrome.storage.local.set({ [key]: el.checked }); } catch {}
    });
  }
  const font = document.getElementById('optFont');
  font.value = o.font;
  font.addEventListener('change', async () => {
    o.font = font.value; applyOpts(o);
    try { await chrome.storage.local.set({ font: font.value }); } catch {}
  });
  applyOpts(o);

  // El PDF siempre sale en claro
  let wasDark = false;
  window.addEventListener('beforeprint', () => { wasDark = document.body.classList.contains('dark'); document.body.classList.remove('dark'); });
  window.addEventListener('afterprint', () => { if (wasDark) document.body.classList.add('dark'); });
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function render(data) {
  const lang = (chrome.i18n.getUILanguage() || 'es').split('-')[0];
  document.documentElement.lang = data.lang || lang;

  const title = document.getElementById('docTitle');
  title.textContent = data.title;
  document.title = data.title;
  title.addEventListener('input', () => { document.title = title.textContent.trim() || data.title; });

  const meta = document.getElementById('docMeta');
  const date = new Date(data.date).toLocaleString(chrome.i18n.getUILanguage(), { dateStyle: 'long', timeStyle: 'short' });
  const parts = [data.site, date];
  if (data.mode === 'chat') parts.push(t('messagesCount', String(data.messages.length)));
  if (data.mode === 'selection') parts.push(t('modeSelection'));
  if (data.mode === 'page') parts.push(t('modePage'));
  meta.textContent = parts.join(' · ') + ' · ';
  const link = document.createElement('a');
  link.href = /^https?:/.test(data.url) ? data.url : '#';
  link.textContent = t('source');
  link.target = '_blank'; link.rel = 'noopener noreferrer';
  meta.appendChild(link);

  const box = document.getElementById('messages');
  const roleName = { user: t('roleUser'), assistant: data.site && data.mode === 'chat' ? data.site : t('roleAssistant'), content: t('roleContent') };
  for (const m of data.messages) {
    const wrap = document.createElement('section');
    wrap.className = `msg ${m.role}`;
    if (m.role !== 'content') {
      const who = document.createElement('div');
      who.className = 'who';
      who.textContent = roleName[m.role] || m.role;
      wrap.appendChild(who);
    }
    const body = document.createElement('div');
    body.className = 'body';
    body.append(...sanitize(m.html).childNodes);
    wrap.appendChild(body);
    box.appendChild(wrap);
  }
  if (data.mode !== 'chat') document.getElementById('optPrompts').closest('label').hidden = true;

  // Resaltado de código
  if (window.hljs) {
    box.querySelectorAll('pre code').forEach((code) => {
      const lang = code.parentElement.getAttribute('data-lang');
      if (lang && hljs.getLanguage(lang)) code.classList.add(`language-${lang}`);
      try { hljs.highlightElement(code); } catch {}
    });
  }
}

// ---------------------------------------------------------------------------
// Avisos de donación (1 vez por cada año desde la instalación) y de valoración
// (cada 5 usos). Todo se cuenta en local: nada sale del navegador.
// ---------------------------------------------------------------------------
const REVIEW_URL = 'https://chromewebstore.google.com/detail/debjfadjodahfmiabgdclllhgoggaiap/reviews';
const YEAR_MS = 365.25 * 24 * 3600 * 1000;

async function maybeAsk() {
  const st = await chrome.storage.local.get({
    installDate: 0, uses: 0, donateYearsShown: 0, reviewDone: false, reviewShown: 0
  });
  const uses = st.uses + 1;
  const update = { uses };
  if (!st.installDate) update.installDate = Date.now();
  const years = st.installDate ? Math.floor((Date.now() - st.installDate) / YEAR_MS) : 0;

  if (years >= 1 && st.donateYearsShown < years) {
    update.donateYearsShown = years;          // solo una vez por año
    await chrome.storage.local.set(update);
    const dlg = document.getElementById('donateDialog');
    document.getElementById('donateGo').href = `${t('moreUrl')}#donar`;
    document.getElementById('donateGo').addEventListener('click', () => dlg.close());
    document.getElementById('donateLater').addEventListener('click', () => dlg.close());
    dlg.showModal();
    return;                                   // no mostrar dos avisos a la vez
  }

  if (!st.reviewDone && uses % 5 === 0) {
    const shown = st.reviewShown + 1;
    update.reviewShown = shown;
    await chrome.storage.local.set(update);
    const bar = document.getElementById('reviewBar');
    const never = document.getElementById('reviewNever');
    const done = async () => { bar.hidden = true; try { await chrome.storage.local.set({ reviewDone: true }); } catch {} };
    document.getElementById('reviewGo').href = REVIEW_URL;
    document.getElementById('reviewGo').addEventListener('click', done);
    document.getElementById('reviewLater').addEventListener('click', () => { bar.hidden = true; });
    if (shown >= 3) { never.hidden = false; never.addEventListener('click', done); }
    bar.hidden = false;
    return;
  }

  await chrome.storage.local.set(update);
}

function notFound() {
  document.getElementById('docTitle').textContent = '—';
  const p = document.createElement('p');
  p.className = 'notfound';
  p.textContent = t('notFound');
  document.getElementById('messages').appendChild(p);
}

(async () => {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.title = t('printTitle');
  document.getElementById('moreLink').href = t('moreUrl');
  const cl = document.getElementById('creditLink');
  cl.textContent = t('extShortName');
  cl.href = t('moreUrl');
  await initOpts();
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  const id = new URLSearchParams(location.search).get('id');
  try {
    const key = `doc_${id}`;
    const stored = await chrome.storage.session.get(key);
    const data = stored[key];
    if (!data) { notFound(); return; }
    render(data);
    try { await maybeAsk(); } catch (err) { console.warn(err); }
    // Limpieza: borrar documentos de más de 6 horas (los datos de sesión
    // desaparecen de todas formas al cerrar Chrome).
    const all = await chrome.storage.session.get(null);
    const old = Object.keys(all).filter((k) => k.startsWith('doc_') && k !== key &&
      Date.now() - Number(k.slice(4).split('-')[0]) > 6 * 3600 * 1000);
    if (old.length) await chrome.storage.session.remove(old);
  } catch (err) {
    console.error(err);
    notFound();
  }
})();
