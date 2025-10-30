# Admin View - Agent 2 Bereich

## 📋 Übersicht

Die Admin View ist die Steuerzentrale für den Moderator (iPad). Sie bietet vollständige Kontrolle über den Spielablauf, Spieler-Management und Score-Verwaltung.

## 🏗️ Struktur

```
admin-view/
├── components/          # UI-Komponenten
│   ├── MiniMatrix.svelte          # Interaktive Mini-Matrix
│   ├── PlayerDashboard.svelte     # Spieler-Liste mit Score-Controls
│   ├── BuzzerQueue.svelte         # Buzzer-Reihenfolge Anzeige
│   └── QuestionControl.svelte     # Frage-Kontrolle (Reveal, Return)
├── services/           # Services
│   └── adminWebSocket.ts           # WebSocket Client für Admin
├── stores/             # State Management
│   └── adminState.ts               # Admin-spezifische Stores
└── index.ts            # Exports
```

## 🧩 Komponenten

### MiniMatrixComponent
- Kompakte, interaktive Version der Game View Matrix
- Alle Zellen sind klickbar (nicht read-only)
- Visual Feedback beim Hover
- State-Indikatoren (available/selected/completed)
- Touch-optimiert für iPad

### PlayerDashboardComponent
- Liste aller registrierten Spieler
- Sortiert nach Punkten (höchste zuerst)
- Score-Buttons für jeden Spieler (+/-)
- Visual Indicator für aktiven Spieler
- Real-time Updates via WebSocket

### BuzzerQueueComponent
- Zeigt Buzzer-Reihenfolge nach Reaktionszeit
- Klickbar: Admin kann Spieler auswählen
- Highlight für ausgewählten Spieler
- Auto-Update bei neuen Buzzes

### QuestionControlComponent
- Zeigt aktuelle Frage (wenn ausgewählt)
- Button zum Revealen der Antwort
- Button zum Zurückkehren zur Matrix
- Disabled States für bessere UX

## 🔌 API Routes

### Game Control
- `POST /api/game/select-question` - Frage auswählen
- `POST /api/game/reveal-answer` - Antwort revealen
- `POST /api/game/return-to-matrix` - Zurück zur Matrix

### Score Management
- `POST /api/players/:playerId/score` - Score aktualisieren

## 🔐 Authentifizierung

Die Admin View erfordert einen Token-Parameter:
```
/admin?token=SECRET_TOKEN
```

Der Token wird auch in API-Requests als Header gesendet:
```
X-Admin-Token: SECRET_TOKEN
```

## 🔄 WebSocket Events

### Gesendete Events
- `admin:select-question` - Frage auswählen
- `admin:reveal-answer` - Antwort revealen
- `admin:update-score` - Score aktualisieren
- `admin:return-to-matrix` - Zurück zur Matrix

### Empfangene Events
- `player:buzzed` - Buzzer wurde gedrückt
- `player:registered` - Spieler hat sich registriert
- `player:score-updated` - Score wurde aktualisiert
- `state:sync` - Vollständiger State Sync

## 📱 Responsive Design

- **iPad Portrait (768x1024):** Side-by-Side Layout
- **iPad Landscape (1024x768):** Größere Mini-Matrix
- **Fallback:** Stack Layout für kleinere Displays

## 🎨 Design

- Weihnachtliche Farbpalette (Rot, Grün, Gold)
- Touch-optimierte Buttons (min 44x44px)
- Dark Theme mit Gradient-Overlays
- Smooth Transitions und Hover-Effekte

## ✅ SOLID-Prinzipien

- **Single Responsibility:** Jede Komponente hat eine klare Aufgabe
- **Open/Closed:** Erweiterbar ohne Modifikation bestehender Komponenten
- **Dependency Inversion:** Abhängigkeiten über Interfaces (Shared Types)
- **Interface Segregation:** Kleine, spezifische Interfaces
- **Keine direkten Abhängigkeiten** zu Game oder Player View
