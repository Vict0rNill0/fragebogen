const config = window.GRUNDSCHULSPORTFESTE_CONFIG || { endpoint: '' };
const endpoint = (config.endpoint || '').trim();
const events = JSON.parse(document.getElementById('event-data').textContent);
const tokenKey = 'grundschulsportfeste.deleteTokens';
const demoKey = 'grundschulsportfeste.demoData';

let state = { signups: [], comments: [] };

const readTokens = () => {
  try {
    return JSON.parse(localStorage.getItem(tokenKey) || '[]');
  } catch {
    return [];
  }
};

const writeTokens = (tokens) => localStorage.setItem(tokenKey, JSON.stringify([...new Set(tokens)]));
const hasToken = (token) => token && readTokens().includes(token);
const addToken = (token) => writeTokens([...readTokens(), token]);
const removeToken = (token) => writeTokens(readTokens().filter((item) => item !== token));

const setCardSaving = (card, saving) => {
  card?.classList.toggle('is-saving', saving);
};

const addEntry = (collection, entry) => {
  state[collection] = [...state[collection], entry];
  render();
};

const replaceEntryToken = (collection, oldToken, newToken) => {
  state[collection] = state[collection].map((entry) =>
    entry.delete_token === oldToken ? { ...entry, delete_token: newToken } : entry,
  );
  render();
};

const removeEntry = (token) => {
  const removed = {
    signups: state.signups.filter((entry) => entry.delete_token === token),
    comments: state.comments.filter((entry) => entry.delete_token === token),
  };
  state.signups = state.signups.filter((entry) => entry.delete_token !== token);
  state.comments = state.comments.filter((entry) => entry.delete_token !== token);
  render();
  return removed;
};

const restoreEntries = (removed) => {
  state.signups = [...state.signups, ...removed.signups];
  state.comments = [...state.comments, ...removed.comments];
  render();
};

const showToast = (message) => {
  const oldToast = document.querySelector('.toast');
  oldToast?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2800);
};

const setStatus = (title, text, variant = '') => {
  const card = document.querySelector('[data-status-card]');
  if (!card) return;
  card.classList.remove('is-hidden');
  card.classList.toggle('is-demo', variant === 'demo');
  card.classList.toggle('is-error', variant === 'error');
  card.querySelector('[data-status-title]').textContent = title;
  card.querySelector('[data-status-text]').textContent = text;
};

const clearStatus = () => {
  const card = document.querySelector('[data-status-card]');
  if (!card) return;
  card.classList.add('is-hidden');
};

const makeToken = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readDemo = () => {
  try {
    return JSON.parse(localStorage.getItem(demoKey) || '{"signups":[],"comments":[]}');
  } catch {
    return { signups: [], comments: [] };
  }
};

const writeDemo = (data) => localStorage.setItem(demoKey, JSON.stringify(data));

const request = async (payload) => {
  if (!endpoint) {
    const demo = readDemo();
    if (payload.action === 'delete') {
      demo.signups = demo.signups.filter((item) => item.delete_token !== payload.delete_token);
      demo.comments = demo.comments.filter((item) => item.delete_token !== payload.delete_token);
      writeDemo(demo);
      return { ok: true };
    }

    const deleteToken = makeToken();
    const item = {
      event_slug: payload.event_slug,
      name: payload.name,
      text: payload.text || '',
      delete_token: deleteToken,
      timestamp: new Date().toISOString(),
    };
    if (payload.type === 'kommentar') demo.comments.push({ ...item, text: payload.text });
    if (payload.type === 'anmeldung') demo.signups.push(item);
    writeDemo(demo);
    return { ok: true, delete_token: deleteToken };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'Die Anfrage ist fehlgeschlagen.');
  return result;
};

const loadData = async () => {
  if (!endpoint) {
    setStatus('Google Sheets ist noch nicht verbunden', 'Einträge bleiben gerade nur in diesem Browser sichtbar. Bitte die Apps-Script-URL konfigurieren.', 'error');
    state = readDemo();
    render();
    return;
  }

  try {
    const response = await fetch(`${endpoint}?t=${Date.now()}`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'Daten konnten nicht geladen werden.');
    state = { signups: result.signups || [], comments: result.comments || [] };
    clearStatus();
    render();
  } catch (error) {
    setStatus('Google Sheets ist noch nicht verbunden', 'Einträge können erst auf allen Geräten geteilt werden, wenn die Apps-Script-Berechtigung freigegeben ist.', 'error');
  }
};

const renderTeacher = (entry) => {
  const item = document.createElement('article');
  item.className = 'teacher-item';

  const top = document.createElement('div');
  top.className = 'teacher-top';
  const name = document.createElement('strong');
  name.textContent = entry.name;
  top.append(name);
  if (entry.delete_token && !String(entry.delete_token).startsWith('pending-')) {
    top.append(renderDeleteButton(entry.delete_token));
  }
  item.append(top);

  if (entry.text) {
    const text = document.createElement('p');
    text.textContent = entry.text;
    item.append(text);
  }

  return item;
};

const renderComment = (entry) => {
  const item = document.createElement('article');
  item.className = 'comment-item';

  const top = document.createElement('div');
  top.className = 'comment-top';
  const name = document.createElement('strong');
  name.textContent = entry.name;
  top.append(name);
  if (entry.delete_token && !String(entry.delete_token).startsWith('pending-')) {
    top.append(renderDeleteButton(entry.delete_token));
  }

  const text = document.createElement('p');
  text.textContent = entry.text;
  item.append(top, text);
  return item;
};

const renderDeleteButton = (token) => {
  const button = document.createElement('button');
  button.className = 'delete-button';
  button.type = 'button';
  button.title = 'Eintrag löschen';
  button.textContent = '×';
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Diesen Eintrag wirklich löschen?')) return;
    const card = event.currentTarget.closest('[data-event-id]');
    const removed = removeEntry(token);
    setCardSaving(card, true);
    try {
      await request({ action: 'delete', delete_token: token });
      removeToken(token);
      loadData();
      showToast('Eintrag gelöscht.');
    } catch (error) {
      restoreEntries(removed);
      showToast(error.message);
    } finally {
      setCardSaving(card, false);
    }
  });
  return button;
};

const render = () => {
  for (const event of events) {
    const card = document.querySelector(`[data-event-id="${event.id}"]`);
    const signups = state.signups.filter((item) => item.event_slug === event.id);
    const comments = state.comments.filter((item) => item.event_slug === event.id);
    const names = signups.map((item) => item.name);

    card.querySelector('[data-summary-count]').textContent = signups.length;
    card.querySelector('[data-summary-names]').textContent = names.length
      ? names.join(', ')
      : 'Noch keine Lehrkraft eingetragen';
    card.querySelector('[data-teacher-count]').textContent = `${signups.length} eingetragen`;
    card.querySelector('[data-comment-count]').textContent = `${comments.length} Kommentare`;

    const teacherList = card.querySelector('[data-teacher-list]');
    teacherList.replaceChildren(...(signups.length ? signups.map(renderTeacher) : [empty('Noch niemand eingetragen.')]));

    const commentList = card.querySelector('[data-comment-list]');
    commentList.replaceChildren(...(comments.length ? comments.map(renderComment) : [empty('Noch keine Hinweise.')]));
  }
};

const empty = (text) => {
  const p = document.createElement('p');
  p.className = 'empty-state';
  p.textContent = text;
  return p;
};

const submitWithBusy = async (form, callback) => {
  const button = form.querySelector('button[type="submit"]');
  const card = form.closest('[data-event-id]');
  button.disabled = true;
  setCardSaving(card, true);
  try {
    await callback(new FormData(form));
    form.reset();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
    setCardSaving(card, false);
  }
};

for (const card of document.querySelectorAll('[data-event-id]')) {
  const eventSlug = card.dataset.eventId;
  card.querySelector('[data-signup-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    submitWithBusy(event.currentTarget, async (formData) => {
      const tempToken = `pending-${makeToken()}`;
      const entry = {
        event_slug: eventSlug,
        name: String(formData.get('name')).trim(),
        text: String(formData.get('text')).trim(),
        delete_token: tempToken,
        timestamp: new Date().toISOString(),
      };
      addToken(tempToken);
      addEntry('signups', entry);

      let result;
      try {
        result = await request({
          type: 'anmeldung',
          event_slug: eventSlug,
          name: entry.name,
          text: entry.text,
        });
      } catch (error) {
        removeToken(tempToken);
        removeEntry(tempToken);
        throw error;
      }
      removeToken(tempToken);
      addToken(result.delete_token);
      replaceEntryToken('signups', tempToken, result.delete_token);
      showToast('Dein Interesse ist eingetragen.');
      loadData();
    });
  });

  card.querySelector('[data-comment-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    submitWithBusy(event.currentTarget, async (formData) => {
      const tempToken = `pending-${makeToken()}`;
      const entry = {
        event_slug: eventSlug,
        name: String(formData.get('name')).trim(),
        text: String(formData.get('text')).trim(),
        delete_token: tempToken,
        timestamp: new Date().toISOString(),
      };
      addToken(tempToken);
      addEntry('comments', entry);

      let result;
      try {
        result = await request({
          type: 'kommentar',
          event_slug: eventSlug,
          name: entry.name,
          text: entry.text,
        });
      } catch (error) {
        removeToken(tempToken);
        removeEntry(tempToken);
        throw error;
      }
      removeToken(tempToken);
      addToken(result.delete_token);
      replaceEntryToken('comments', tempToken, result.delete_token);
      showToast('Kommentar gespeichert.');
      loadData();
    });
  });
}

loadData();
window.setInterval(loadData, 10000);
