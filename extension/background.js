// Chats de IA → Vista limpia + PDF — service worker

// Pantalla de bienvenida: al instalar, y al actualizar desde la 1.x
// (los usuarios de la versión anterior descubren que ahora vale para cualquier IA).
chrome.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
  const fromV1 = reason === 'update' && /^1\./.test(previousVersion || '');
  if (reason === 'install' || fromV1) {
    try {
      await chrome.tabs.create({ url: chrome.runtime.getURL('welcome/welcome.html') });
    } catch (err) {
      console.warn(err);
    }
  }
});

async function flashError(tabId) {
  try {
    await chrome.action.setBadgeBackgroundColor({ color: '#d93025', tabId });
    await chrome.action.setBadgeText({ text: '!', tabId });
    await chrome.action.setTitle({ title: chrome.i18n.getMessage('badgeError'), tabId });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId }).catch(() => {});
      chrome.action.setTitle({ title: chrome.i18n.getMessage('actionTitle'), tabId }).catch(() => {});
    }, 4000);
  } catch (err) {
    console.warn(err);
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.action.setBadgeBackgroundColor({ color: '#1a73e8', tabId: tab.id });
    await chrome.action.setBadgeText({ text: '…', tabId: tab.id });

    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['extract.js']
    });
    const data = injection?.result;
    await chrome.action.setBadgeText({ text: '', tabId: tab.id });

    if (!data || !data.messages?.length) {
      await flashError(tab.id);
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await chrome.storage.session.set({ [`doc_${id}`]: data });
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`print/print.html?id=${id}`),
      index: tab.index + 1,
      openerTabId: tab.id
    });
  } catch (err) {
    console.warn('[IA → PDF]', err);
    await flashError(tab.id);
  }
});
