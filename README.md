# Fragebogen

Astro-basierte GitHub-Pages-Seite für öffentliche Fragebogen und Terminabsprachen.

Der erste Fragebogen ist `Grundschulsportfeste 2026/2027 Alt-Herne` unter `/grundschulsportfeste/`.

Die Idee ist: ein GitHub-Pages-Repo, mehrere Fragebogen-URLs. Jeder neue Fragebogen bekommt eine eigene Astro-Seite in `src/pages/`, zum Beispiel:

- `src/pages/grundschulsportfeste.astro` -> `/grundschulsportfeste/`
- `src/pages/elternabend.astro` -> `/elternabend/`
- `src/pages/projekttag.astro` -> `/projekttag/`

Nach Veröffentlichung über GitHub Pages ist dieser erste Fragebogen direkt teilbar unter:

```text
https://Vict0rNill0.github.io/fragebogen/grundschulsportfeste/
```

## Was die Seite macht

- Zeigt alle Sporttermine aus der Excel als mobile Karten.
- Zeigt schon in der Übersicht, welche Lehrkräfte sich eingetragen haben.
- Pro Termin kann eine Lehrkraft ihren Namen eintragen.
- Pro Termin gibt es öffentliche Kommentare/Hinweise.
- Eigene Einträge können vom gleichen Browser wieder gelöscht werden.
- Ohne Google-Sheets-URL speichert die Seite beim lokalen Testen nur im Browser. Sobald `public/config.js` die Apps-Script-URL enthält, werden die Einträge in Google Sheets gespeichert.

## Entwicklung lokal

```bash
npm install
npm run dev
```

Dann öffnen: `http://localhost:4321/grundschulsportfeste/`

Auf RIG im Netzwerk:

```text
http://rig:4321/grundschulsportfeste/
http://192.168.178.98:4321/grundschulsportfeste/
```

## Google Sheets einrichten

### Automatisch mit clasp

`clasp` ist auf RIG installiert und mit Google als `vkmatias@gmail.com` angemeldet.

Der Apps-Script-Projektlink wurde bereits erstellt:

```text
https://script.google.com/d/1A1doOwkPvNczgY9Rb2IuELbqKBpvpnRVJQmM2kBSTm_9xFrGj8i3nX4E/edit
```

Aus dem Projektordner:

```bash
cd google-apps-script
clasp push
clasp deploy --description "Initial deployment"
```

Der aktuelle Stand: `clasp` kann das Apps-Script-Projekt erstellen, Code pushen und Deployments anlegen. Die CLI-Deployments werden aber von Google aktuell nicht als anonym öffentlich ausführbare Web-App freigegeben. Wenn der Endpoint `Zugriff verweigert` zeigt, einmalig im Browser öffnen:

```text
https://script.google.com/d/1A1doOwkPvNczgY9Rb2IuELbqKBpvpnRVJQmM2kBSTm_9xFrGj8i3nX4E/edit
```

Dann: `Bereitstellen` -> `Bereitstellungen verwalten` -> Stift/Edit -> Web-App -> `Ausführen als: Ich` und `Wer hat Zugriff: Jeder` -> Bereitstellen. Google fragt dabei wahrscheinlich nach einer einmaligen Berechtigung für Tabellenzugriff.

Beim ersten erfolgreichen GET/POST erstellt das Script automatisch das Google Sheet und legt die Tabs `Teilnahmen` und `Kommentare` an.

Nach dem Deployment die Web-App-URL in `public/config.js` eintragen.

### Manuell über die Google-Oberfläche

1. Google Sheet erstellen, z. B. `Grundschulsportfeste 2026-2027 Alt-Herne`.
2. Im Sheet: `Erweiterungen` -> `Apps Script` öffnen.
3. Inhalt aus `google-apps-script/Code.gs` einfügen.
4. Speichern.
5. `Bereitstellen` -> `Neue Bereitstellung` -> Typ `Web-App`.
6. Ausführen als: `Ich`.
7. Zugriff: `Jeder`.
8. Bereitstellen und die Web-App-URL kopieren.
9. URL in `public/config.js` eintragen:

```js
window.GRUNDSCHULSPORTFESTE_CONFIG = {
  endpoint: 'https://script.google.com/macros/s/DEINE_DEPLOYMENT_ID/exec',
};
```

Die Script-Datei legt die Tabs `Teilnahmen` und `Kommentare` automatisch an.

## GitHub Pages

Die GitHub Action in `.github/workflows/deploy.yml` baut die Astro-Seite und deployt sie über GitHub Pages.

In GitHub muss unter `Settings` -> `Pages` als Source `GitHub Actions` ausgewählt sein.

## Wichtige Dateien

- `src/data/events.ts` - alle Termine aus der Excel.
- `src/pages/grundschulsportfeste.astro` - Hauptseite.
- `public/app.js` - Laden, Speichern, Löschen und lokaler Browser-Fallback.
- `public/config.js` - Google-Apps-Script-URL.
- `google-apps-script/Code.gs` - Backend für Google Sheets.
