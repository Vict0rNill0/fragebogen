const SHEETS = {
  signups: 'Teilnahmen',
  comments: 'Kommentare',
};

const SPREADSHEET_PROPERTY = 'SPREADSHEET_ID';

const HEADERS = {
  signups: ['event_slug', 'name', 'text', 'delete_token', 'timestamp'],
  comments: ['event_slug', 'name', 'text', 'delete_token', 'timestamp'],
};

function doGet() {
  try {
    ensureSheets_();
    return json_({
      ok: true,
      signups: rows_(SHEETS.signups, HEADERS.signups),
      comments: rows_(SHEETS.comments, HEADERS.comments),
    });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function doPost(event) {
  try {
    ensureSheets_();
    const payload = parsePayload_(event);

    if (payload.action === 'delete') {
      deleteByToken_(payload.delete_token);
      return json_({ ok: true });
    }

    if (payload.type === 'anmeldung') return addSignup_(payload);
    if (payload.type === 'kommentar') return addComment_(payload);

    throw new Error('Unbekannte Anfrage.');
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function addSignup_(payload) {
  const eventSlug = clean_(payload.event_slug, 120);
  const name = clean_(payload.name, 80);
  const text = clean_(payload.text, 600);
  if (!eventSlug || !name) throw new Error('Veranstaltung und Name sind erforderlich.');

  const deleteToken = Utilities.getUuid();
  spreadsheet_().getSheetByName(SHEETS.signups).appendRow([
    eventSlug,
    name,
    text,
    deleteToken,
    new Date().toISOString(),
  ]);
  return json_({ ok: true, delete_token: deleteToken });
}

function addComment_(payload) {
  const eventSlug = clean_(payload.event_slug, 120);
  const name = clean_(payload.name, 80);
  const text = clean_(payload.text, 600);
  if (!eventSlug || !name || !text) throw new Error('Veranstaltung, Name und Text sind erforderlich.');

  const deleteToken = Utilities.getUuid();
  spreadsheet_().getSheetByName(SHEETS.comments).appendRow([
    eventSlug,
    name,
    text,
    deleteToken,
    new Date().toISOString(),
  ]);
  return json_({ ok: true, delete_token: deleteToken });
}

function deleteByToken_(deleteToken) {
  const token = clean_(deleteToken, 120);
  if (!token) throw new Error('Delete token fehlt.');

  [SHEETS.signups, SHEETS.comments].forEach((sheetName) => {
    const sheet = spreadsheet_().getSheetByName(sheetName);
    const values = sheet.getDataRange().getValues();
    const header = values[0];
    const tokenIndex = header.indexOf('delete_token');
    for (let row = values.length - 1; row >= 1; row--) {
      if (values[row][tokenIndex] === token) sheet.deleteRow(row + 1);
    }
  });
}

function rows_(sheetName, headers) {
  const sheet = spreadsheet_().getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] instanceof Date ? row[index].toISOString() : row[index];
    });
    return item;
  });
}

function ensureSheets_() {
  const spreadsheet = spreadsheet_();
  ensureSheet_(spreadsheet, SHEETS.signups, HEADERS.signups);
  ensureSheet_(spreadsheet, SHEETS.comments, HEADERS.comments);
}

function setup() {
  const spreadsheet = spreadsheet_();
  ensureSheets_();
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
}

function spreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty(SPREADSHEET_PROPERTY);
  if (!spreadsheetId) {
    const spreadsheet = SpreadsheetApp.create('Grundschulsportfeste 2026-2027 Alt-Herne');
    properties.setProperty(SPREADSHEET_PROPERTY, spreadsheet.getId());
    return spreadsheet;
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = headers.some((header, index) => firstRow[index] !== header);
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function parsePayload_(event) {
  if (!event || !event.postData || !event.postData.contents) throw new Error('Leere Anfrage.');
  return JSON.parse(event.postData.contents);
}

function clean_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
