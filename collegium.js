const config = window.GRUNDSCHULSPORTFESTE_CONFIG || { endpoint: '' };
const endpoint = (config.endpoint || '').trim();
const eventSlug = 'collegiumstreffen-2026-10-14';
const tokenKey = 'grundschulsportfeste.deleteTokens';
let signups = [];

const tokens = () => {
  try { return JSON.parse(localStorage.getItem(tokenKey) || '[]'); } catch { return []; }
};
const saveTokens = (items) => localStorage.setItem(tokenKey, JSON.stringify([...new Set(items)]));
const addToken = (token) => saveTokens([...tokens(), token]);
const removeToken = (token) => saveTokens(tokens().filter((item) => item !== token));
const temporaryToken = () => `pending-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

const setDanceStatus = (message, type = '') => {
  const element = document.querySelector('[data-dance-status]');
  element.textContent = message;
  element.className = `dance-status ${type}`;
};

const deleteButton = (token) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dance-delete';
  button.title = 'Eintrag löschen';
  button.textContent = '×';
  button.addEventListener('click', async () => {
    if (!confirm('Diesen Eintrag wirklich löschen?')) return;
    button.disabled = true;
    try {
      await request({ action: 'delete', delete_token: token });
      signups = signups.filter((entry) => entry.delete_token !== token);
      removeToken(token);
      render();
      setDanceStatus('Eintrag gelöscht.', 'success');
    } catch (error) {
      button.disabled = false;
      setDanceStatus(error.message, 'error');
    }
  });
  return button;
};

const render = () => {
  const list = document.querySelector('[data-dance-attendees]');
  if (!signups.length) {
    list.replaceChildren(Object.assign(document.createElement('p'), { className: 'empty-state', textContent: 'Noch niemand eingetragen.' }));
    return;
  }
  list.replaceChildren(...signups.map((entry) => {
    const item = document.createElement('div');
    item.className = 'dance-attendee';
    const name = document.createElement('strong');
    name.textContent = entry.name;
    item.append(name);
    if (entry.delete_token && !entry.delete_token.startsWith('pending-')) item.append(deleteButton(entry.delete_token));
    return item;
  }));
};

const request = async (payload) => {
  if (!endpoint) throw new Error('Die gemeinsame Verbindung ist noch nicht eingerichtet.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'Die Anfrage ist fehlgeschlagen.');
  return result;
};

const load = async () => {
  try {
    const response = await fetch(`${endpoint}?t=${Date.now()}`);
    const result = await response.json();
    signups = (result.signups || []).filter((entry) => entry.event_slug === eventSlug);
    render();
  } catch {
    setDanceStatus('Die gemeinsame Liste konnte gerade nicht geladen werden.', 'error');
  }
};

document.querySelector('[data-dance-form]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const name = String(new FormData(form).get('name')).trim();
  const pending = { event_slug: eventSlug, name, delete_token: temporaryToken(), timestamp: new Date().toISOString() };
  signups = [...signups, pending];
  addToken(pending.delete_token);
  render();
  button.disabled = true;
  setDanceStatus('Deine Rückmeldung wird gespeichert ...', 'saving');
  try {
    const result = await request({ type: 'anmeldung', event_slug: eventSlug, name });
    removeToken(pending.delete_token);
    addToken(result.delete_token);
    signups = signups.map((entry) => entry.delete_token === pending.delete_token ? { ...entry, delete_token: result.delete_token } : entry);
    form.reset();
    render();
    setDanceStatus('Danke, du bist eingetragen!', 'success');
    load();
  } catch (error) {
    signups = signups.filter((entry) => entry.delete_token !== pending.delete_token);
    removeToken(pending.delete_token);
    render();
    setDanceStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
});

load();
window.setInterval(load, 10000);
