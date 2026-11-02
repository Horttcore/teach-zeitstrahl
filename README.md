# Interaktiver Zahlenstrahl (Klasse 4)

Zahl zwischen **Untergrenze** und **Obergrenze** auf dem linearen Zahlenstrahl platzieren.

## Lokal testen

```bash
python3 -m http.server 8080
```

→ http://localhost:8080

## Bedienung

- Gesuchte Zahl steht oben; der Strahl zeigt **Untergrenze** und **Obergrenze**
- Marker **ziehen**, auf den Strahl **tippen** oder **← / →** (Fokus auf dem Strahl)
- **Prüfen** — bei Fehler erscheint ein grüner Lösungsstrich
- **Nächste Aufgabe** — neuer Strahl mit neuen Grenzen

## GitHub Pages

Live: **https://horttcore.github.io/teach-zeitstrahl/**

Branch `main`, Ordner `/ (root)`.

## Anpassen

Neue Strahl-Spannen in [`js/scale.js`](js/scale.js) (`SPANS`).
