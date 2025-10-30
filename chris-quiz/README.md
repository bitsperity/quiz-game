# Chris Quiz - Weihnachts-Quiz App

Eine SvelteKit-basierte Quiz-App mit modularem Aufbau für parallele Agent-Entwicklung.

## 🏗️ Architektur

Die App ist in drei unabhängige Agent-Bereiche aufgeteilt:

1. **Agent 1: Game View** (`/game`) - TV Display (read-only)
2. **Agent 2: Admin View** (`/admin`) - iPad Control Panel
3. **Agent 3: Player View** (`/player`) - Smartphone Interface

### SOLID-Prinzipien

- **Single Responsibility**: Jeder Agent-Bereich hat eine klare Verantwortlichkeit
- **Open/Closed**: Erweiterbar ohne Modifikation bestehender Bereiche
- **Liskov Substitution**: Interfaces sind austauschbar
- **Interface Segregation**: Kleine, spezifische Interfaces in `src/lib/shared/interfaces/`
- **Dependency Inversion**: Abhängigkeiten über Interfaces, nicht direkte Implementierungen

## 📁 Projektstruktur

```
chris-quiz/
├── src/
│   ├── lib/
│   │   ├── shared/           # Shared Code für alle Agents
│   │   │   ├── types/        # TypeScript Types
│   │   │   ├── interfaces/   # SOLID Interfaces
│   │   │   └── config/       # Shared Constants
│   │   ├── game-view/        # Agent 1 Bereich
│   │   ├── admin-view/       # Agent 2 Bereich
│   │   └── player-view/      # Agent 3 Bereich
│   └── routes/
│       ├── game/             # Game View Route
│       ├── admin/            # Admin View Route
│       ├── player/           # Player View Route
│       └── api/              # API Routes
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🚀 Entwicklung

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# App läuft auf http://localhost:54321
```

### Docker Entwicklung

```bash
# Build und Start
docker-compose up --build

# Im Hintergrund
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Stoppen
docker-compose down
```

## 👥 Agent-Arbeit

### Agent 1: Game View
- Arbeite in `src/lib/game-view/` und `src/routes/game/`
- Nutze Shared Types aus `src/lib/shared/types/`
- Implementiere Components unabhängig von anderen Views

### Agent 2: Admin View
- Arbeite in `src/lib/admin-view/` und `src/routes/admin/`
- Nutze Shared Interfaces für Services
- Implementiere Admin Controls unabhängig

### Agent 3: Player View
- Arbeite in `src/lib/player-view/` und `src/routes/player/`
- Nutze Shared Types und Interfaces
- Implementiere Player Features unabhängig

## 🔌 WebSocket Integration

WebSocket Server wird in `src/lib/server/websocket/` implementiert.
Alle Views kommunizieren über WebSocket Events (siehe `src/lib/shared/types/index.ts`).

## 📊 Datenbank

SQLite wird für Persistenz verwendet:
- Fragen & Kategorien
- Spieler-Registrierungen
- Spiel-Historie

Datenbank-Pfad: `./data/quiz.db` (wird automatisch erstellt)

## 🔐 Authentifizierung

Admin View erfordert Token:
```
http://localhost:54321/admin?token=SECRET_TOKEN
```

Token wird über Environment Variable `ADMIN_SECRET_TOKEN` gesetzt.

## 📝 TODO

- [ ] Agent 1: Game View implementieren
- [ ] Agent 2: Admin View implementieren
- [ ] Agent 3: Player View implementieren
- [ ] WebSocket Server implementieren
- [ ] Datenbank-Schema erstellen
- [ ] Question Repository implementieren
- [ ] Player Repository implementieren
- [ ] Game State Service implementieren

## 🎨 Design

Weihnachtliche Farbpalette:
- Primary: `#DC143C` (Crimson Red)
- Secondary: `#228B22` (Forest Green)
- Accent: `#FFD700` (Gold)
- Background: `#0F1419` (Dark Blue-Black)
- Text: `#FFF8DC` (Cornsilk)

