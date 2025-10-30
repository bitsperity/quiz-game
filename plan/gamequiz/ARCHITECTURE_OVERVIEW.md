# Weihnachts-Quiz: Architektur-Übersicht

## 🎯 Entscheidung: Eine SvelteKit App vs. Drei Separate Apps

### ✅ **Empfehlung: Eine einzige SvelteKit App**

**Warum eine App besser ist:**

1. **Geteilter Code & Type Safety**
   - Gemeinsame TypeScript-Typen für Game State, Player, Questions
   - Wiederverwendbare Komponenten (z.B. Scoreboard)
   - Einheitliche Utility-Funktionen
   - Single Source of Truth für Business Logic

2. **Einfacheres State Management**
   - Svelte Stores können zentral verwaltet werden
   - WebSocket-Verbindungen werden einmalig etabliert
   - Synchronisierter Game State über alle Views hinweg

3. **Einfacheres Deployment**
   - Ein Docker Container statt drei
   - Ein Port statt drei
   - Einheitliche Environment Variables
   - Einfacheres Logging & Monitoring

4. **Performance**
   - Code-Splitting nach Routes (/game, /admin, /player)
   - Shared Dependencies werden nur einmal geladen
   - Optimierte Bundle-Größe durch Tree-Shaking

5. **Entwickler-Erfahrung**
   - Eine Codebase, ein Build-Prozess
   - Hot Reload für alle Views gleichzeitig
   - Einheitliche Testing-Strategie

**Route-Struktur:**
```
/game          → Game View (TV Display)
/admin         → Admin View (iPad)
/player        → Player View (Smartphones)
/api/*         → Backend Endpoints
/ws            → WebSocket Endpoint
```

---

## 🏗️ System-Architektur

### Client-Typen

1. **Game View** (`/game`)
   - Display auf TV (großer Bildschirm)
   - Primär read-only, empfängt Commands vom Admin
   - Zeigt Matrix → Question → Punktevergabe → zurück zu Matrix

2. **Admin View** (`/admin`)
   - Moderator-Kontrolle auf iPad
   - Steuert den gesamten Game Flow
   - Sieht alle Spieler, verwaltet Punkte

3. **Player View** (`/player`)
   - Mobile-first für Smartphones
   - Login → Scoreboard + Buzzer
   - Minimalistisch, fokussiert auf Reaktionszeit

---

## 🔌 Kommunikations-Architektur

### WebSocket Hub Pattern

**Single WebSocket Server** verwaltet alle Clients:

```
┌─────────────┐
│ Game View   │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐
│ Admin View  │──┼───▶│ WebSocket    │
└─────────────┘  │    │ Hub Server   │
                 │    └──────────────┘
┌─────────────┐  │         │
│ Player 1    │──┘         │
└─────────────┘            │
                           │
┌─────────────┐            │
│ Player N    │────────────┘
└─────────────┘
```

**Event-Typen:**
- `game:question-selected` - Admin wählt Frage
- `game:return-to-matrix` - Zurück zur Matrix
- `player:registered` - Neuer Spieler
- `player:buzzed` - Buzzer wurde gedrückt
- `player:score-updated` - Punkteänderung
- `state:sync` - Vollständiger State Sync bei Connect

---

## 🐳 Docker Container-Landschaft

### Container-Architektur

```
┌─────────────────────────────────────────┐
│ Docker Compose Network                 │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ gamequiz-app (SvelteKit)         │  │
│  │ - Port: 3000                      │  │
│  │ - SSR + API Routes                │  │
│  │ - WebSocket Server                 │  │
│  │ - Static Assets                    │  │
│  └──────────────────────────────────┘  │
│              │                          │
│              ▼                          │
│  ┌──────────────────────────────────┐  │
│  │ gamequiz-db (SQLite)             │  │
│  │ - Volume: ./data/quiz.db         │  │
│  │ - Persistenz für:                │  │
│  │   * Fragen & Kategorien           │  │
│  │   * Spieler-Registrierungen       │  │
│  │   * Spiel-Historie                │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ nginx (Optional)                 │  │
│  │ - Reverse Proxy                   │  │
│  │ - SSL Termination                 │  │
│  │ - Static File Serving              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Minimal-Stack (Empfohlen)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./src:/app/src
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/quiz.db
    restart: unless-stopped

volumes:
  quiz_data:
```

**Warum so minimal?**
- Laptop-Deployment braucht keinen Orchestrierungs-Overhead
- SQLite ist perfekt für Single-Instance
- Keine externen Dependencies (Redis, PostgreSQL, etc.)
- Schneller Startup, geringer Ressourcen-Verbrauch

---

## 📊 State Management

### In-Memory Game State (Server-Side)

```typescript
interface GameState {
  currentView: 'matrix' | 'question-hidden', 'question-reveal';
  selectedQuestion: Question | null;
  players: Map<string, Player>;
  buzzerQueue: BuzzerEntry[];
  questionMatrix: MatrixCell[][];
  gamePhase: 'idle' | 'question' | 'answering' | 'scoring';
}
```

**Warum In-Memory?**
- Extrem schnell für Real-time Updates
- Keine DB-Latency für Buzzer-Reaktionen
- Persistenz nur für Fragen-Daten & Historie
- State wird bei Server-Restart zurückgesetzt (ok für Quiz-Session)

---

## 🎨 Design-Philosophie

### Weihnachtliches, Lightweight Design

**Farbpalette:**
- Primary: `#DC143C` (Crimson Red)
- Secondary: `#228B22` (Forest Green)
- Accent: `#FFD700` (Gold)
- Background: `#0F1419` (Dark Blue-Black)
- Text: `#FFF8DC` (Cornsilk)

**CSS-Strategie:**
- Pure CSS (kein Framework-Overhead)
- CSS Custom Properties für Theming
- CSS Grid & Flexbox für Layouts
- CSS Animations für Buzzer & Transitions
- Gradient-Overlays für weihnachtliche Atmosphäre

**Performance-Prinzipien:**
- Minimal JavaScript Bundle
- CSS-only Animations wo möglich
- Lazy Loading für Admin/Player Routes
- Optimistic UI Updates
- Debounced WebSocket Messages

---

## 🔐 Sicherheit & Isolation

### Client-Isolation

**Game View:**
- Read-only Zugriff
- Kann keine Commands senden
- Empfängt nur Broadcast-Events

**Admin View:**
- Authentifizierung über Secret Token (URL-Parameter: `?token=SECRET`)
- Alle Write-Operations erfordern Admin-Rolle
- Rate Limiting für Score-Updates

**Player View:**
- Keine Authentifizierung nötig
- Nur eigene Buzzer-Events senden
- Kann keine Scores manipulieren

---

## 📱 Responsive Design Strategy

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Smartphones */
--breakpoint-md: 768px;   /* Tablets (iPad) */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1920px;  /* TV Displays */
```

**View-spezifische Optimierungen:**
- Game View: Optimiert für 1080p/4K TV
- Admin View: Tablet-optimiert (iPad)
- Player View: Mobile-first, Portrait-Orientierung

---

## 🚀 Deployment-Strategie

### Lokales Netzwerk Setup

1. **Laptop als Server:**
   ```bash
   docker-compose up -d
   # App läuft auf http://192.168.1.X:3000
   ```

2. **Geräte verbinden:**
   - TV Browser: `http://192.168.1.X:3000/game`
   - iPad: `http://192.168.1.X:3000/admin?token=SECRET`
   - Smartphones: `http://192.168.1.X:3000/player`

3. **Optional: mDNS/Bonjour**
   - `gamequiz.local` für einfacheren Zugriff
   - Automatische Discovery im lokalen Netzwerk

---

## 🔄 Real-Time Synchronisation

### Event-Sourcing Pattern (Lightweight)

**Jede State-Änderung = Event:**
```typescript
type GameEvent = 
  | { type: 'SELECT_QUESTION', questionId: string }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'BUZZER_PRESSED', playerId: string, timestamp: number }
  | { type: 'SCORE_UPDATED', playerId: string, delta: number }
  | { type: 'RETURN_TO_MATRIX' };
```

**Vorteile:**
- Deterministic State Updates
- Event-Replay für neue Clients
- Debugging durch Event-Log
- Einfache Undo/Redo (falls nötig)

---

## 📈 Skalierbarkeit (Future-Proof)

### Aktuell: Single-Instance
- Perfekt für lokales Netzwerk
- ~10-20 Spieler gleichzeitig
- Keine Load Balancing nötig

### Zukünftig erweiterbar:
- Redis für Multi-Instance Deployment
- PostgreSQL statt SQLite für größere Datenmengen
- CDN für Static Assets
- Horizontal Scaling möglich (WebSocket Sticky Sessions)

---

## 🧪 Testing-Strategie

### Unit Tests
- Game State Logic
- Score Calculation
- Buzzer Queue Management

### Integration Tests
- WebSocket Event Flow
- Admin → Game View Communication
- Player Registration Flow

### E2E Tests (Optional)
- Playwright für Full-Game-Flow
- Multi-Browser Simulation

---

## 📝 Tech Stack Summary

**Frontend:**
- SvelteKit (Framework)
- TypeScript (Type Safety)
- CSS (Styling, keine Framework)
- WebSocket Client (Native Browser API)

**Backend:**
- SvelteKit API Routes (Server-Side)
- WebSocket Server (Native Node.js)
- SQLite (Database)
- In-Memory State (Game Logic)

**Infrastructure:**
- Docker (Containerization)
- Docker Compose (Orchestration)
- Nginx (Optional, Reverse Proxy)

**Dev Tools:**
- Vite (Build Tool)
- ESLint (Linting)
- Prettier (Formatting)
- TypeScript Compiler (Type Checking)

---

## 🎯 Next Steps

1. ✅ Architektur-Dokumentation (dieses Dokument)
2. ⏭️ Game View Architektur ausarbeiten
3. ⏭️ Admin View Architektur ausarbeiten
4. ⏭️ Player View Architektur ausarbeiten
5. ⏭️ Prototype mit minimaler Funktionalität
6. ⏭️ Weihnachtliches Design-System implementieren
7. ⏭️ WebSocket Integration
8. ⏭️ Testing & Refinement

