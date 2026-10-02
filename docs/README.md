# Dokumentation

Dieses Repository enthält mehrere nummerierte Fragebogen für die Schule.

## Aufbau

- `src/pages/` enthält die öffentlich erreichbaren Seiten.
- `src/data/` enthält gemeinsam genutzte Daten, zum Beispiel Sporttermine.
- `public/` enthält Browserlogik und Gestaltung.
- `google-apps-script/` enthält den gemeinsamen Google-Sheets-Datendienst.
- `questionnaires/` enthält die menschlich lesbare Ordnung und Notizen zu den einzelnen Fragebogen.

## Öffentliche URLs

- Fragebogen 1: `/fragebogen/grundschulsportfeste/` (abgeschlossenes Archiv)
- Fragebogen 2: `/fragebogen/collegiumstreffen/` (aktuell)

Neue Fragebogen bekommen eine neue Nummer, eine eigene Seite unter `src/pages/` und einen eigenen Abschnitt in `questionnaires/`.
