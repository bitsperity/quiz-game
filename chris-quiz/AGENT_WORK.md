# Agent-Arbeit: Parallele Entwicklung

## 🎯 Übersicht

Diese App ist so strukturiert, dass **3 Agents parallel und unabhängig** arbeiten können. Jeder Agent hat seinen eigenen Bereich und nutzt nur die Shared-Interfaces.

## 👥 Agent-Zuweisungen

### Agent 1: Game View (TV Display)
**Bereich:** `src/lib/game-view/` und `src/routes/game/`

**Aufgaben:**
- Matrix Component erstellen
- Question Display Component
- Buzzer Queue Anzeige
- WebSocket Client für Game View Events
- TV-optimiertes Design

**Arbeitsweise:**
- Nutzt nur Types aus `src/lib/shared/types/`
- Nutzt Interface `IWebSocketService` (nicht die Implementierung)
- Keine direkten Abhängigkeiten zu Admin oder Player View

### Agent 2: Admin View (iPad Control)
**Bereich:** `src/lib/admin-view/` und `src/routes/admin/`

**Aufgaben:**
- Mini Matrix Component
- Player Dashboard
- Score Controls
- Buzzer Queue Management
- Admin Authentication
- API Routes für Game Control

**Arbeitsweise:**
- Nutzt Types und Interfaces aus `src/lib/shared/`
- Implementiert API Routes in `src/routes/api/game/`
- Kann Game State über `IGameStateService` Interface verwalten
- Keine direkten Abhängigkeiten zu Game oder Player View

### Agent 3: Player View (Smartphone)
**Bereich:** `src/lib/player-view/` und `src/routes/player/`

**Aufgaben:**
- Login Component
- Scoreboard Component
- Buzzer Component
- Player Registration API
- Mobile-optimiertes Design

**Arbeitsweise:**
- Nutzt Types und Interfaces aus `src/lib/shared/`
- Implementiert API Routes in `src/routes/api/players/`
- Nutzt `IPlayerRepository` Interface
- Keine direkten Abhängigkeiten zu Game oder Admin View

## 🔒 SOLID-Prinzipien für Unabhängigkeit

### Single Responsibility
Jeder Agent-Bereich hat eine klare, einzige Verantwortlichkeit:
- Game View: Nur Anzeige
- Admin View: Nur Kontrolle
- Player View: Nur Spieler-Interaktion

### Open/Closed
- Agent-Bereiche sind **geschlossen für Modifikation**, aber **offen für Erweiterung**
- Neue Features werden durch neue Komponenten/Services hinzugefügt
- Bestehender Code wird nicht verändert

### Liskov Substitution
- Interfaces können durch verschiedene Implementierungen ersetzt werden
- Z.B. kann `IQuestionRepository` durch SQLite oder In-Memory implementiert werden

### Interface Segregation
- Kleine, spezifische Interfaces:
  - `IGameStateService` - nur Game State
  - `IQuestionRepository` - nur Questions
  - `IPlayerRepository` - nur Players
- Agents nutzen nur die Interfaces, die sie brauchen

### Dependency Inversion
- Agents hängen von **Abstraktionen** (Interfaces) ab, nicht von **Konkretionen**
- Services werden über Interfaces injiziert
- Ermöglicht einfaches Mocking und Testing

## 📋 Arbeitsablauf

### 1. Initial Setup (gemeinsam)
- ✅ Projektstruktur erstellt
- ✅ Shared Types definiert
- ✅ Interfaces definiert
- ✅ Basis-Routes erstellt

### 2. Parallele Entwicklung

**Agent 1 arbeitet an:**
```
src/lib/game-view/
  components/Matrix.svelte
  components/Question.svelte
  stores/gameViewState.ts
  services/gameViewWebSocket.ts

src/routes/game/+page.svelte
```

**Agent 2 arbeitet an:**
```
src/lib/admin-view/
  components/MiniMatrix.svelte
  components/PlayerDashboard.svelte
  stores/adminState.ts
  services/adminWebSocket.ts

src/routes/admin/+page.svelte
src/routes/api/game/select-question/+server.ts
src/routes/api/game/reveal-answer/+server.ts
```

**Agent 3 arbeitet an:**
```
src/lib/player-view/
  components/Login.svelte
  components/Scoreboard.svelte
  components/Buzzer.svelte
  stores/playerState.ts
  services/playerWebSocket.ts

src/routes/player/+page.svelte
src/routes/api/players/register/+server.ts
src/routes/api/game/buzz/+server.ts
```

### 3. Shared Services (später implementieren)
Die Server-seitigen Services werden separat implementiert:
```
src/lib/server/services/
  GameStateService.ts (implementiert IGameStateService)
  QuestionRepository.ts (implementiert IQuestionRepository)
  PlayerRepository.ts (implementiert IPlayerRepository)
```

## 🚫 Was zu vermeiden ist

### ❌ Direkte Abhängigkeiten zwischen Agents
```typescript
// SCHLECHT: Agent 1 importiert aus Agent 2
import { adminState } from '$lib/admin-view/stores/adminState';

// GUT: Nutze Shared Interface
import type { IGameStateService } from '$lib/shared';
```

### ❌ Gemeinsame Komponenten ohne Interface
```typescript
// SCHLECHT: Direkte Komponenten-Importe zwischen Agents
import { Matrix } from '$lib/game-view/components/Matrix';

// GUT: Nutze Shared Types für Props
import type { MatrixProps } from '$lib/shared/types';
```

### ❌ State Sharing über direkte Imports
```typescript
// SCHLECHT: Direkter Store-Import
import { gameState } from '$lib/game-view/stores/gameState';

// GUT: Nutze WebSocket Events oder API Calls
```

## ✅ Best Practices

### ✅ Nutze Shared Types
```typescript
import type { Player, Question, GameState } from '$lib/shared';
```

### ✅ Nutze Interfaces für Services
```typescript
import type { IGameStateService } from '$lib/shared';

// Service wird injiziert, nicht direkt importiert
class MyComponent {
  constructor(private gameStateService: IGameStateService) {}
}
```

### ✅ Kommunikation über WebSocket Events
```typescript
// Alle Agents kommunizieren über WebSocket Events
ws.send({
  type: 'game:question-selected',
  payload: { question }
});
```

### ✅ API Routes für Server-Kommunikation
```typescript
// Agent 2 erstellt API Route
// POST /api/game/select-question
// Andere Agents können über HTTP darauf zugreifen
```

## 🔄 Git Workflow

### Branching-Strategie
```
main
├── agent-1-game-view
├── agent-2-admin-view
└── agent-3-player-view
```

### Merge-Strategie
- Jeder Agent arbeitet auf eigenem Branch
- Merges erfolgen in `main` ohne Konflikte (dank getrennter Bereiche)
- Shared Types/Interfaces werden in `main` gepflegt

## 📝 Checkliste für jeden Agent

### Agent 1 (Game View)
- [ ] Matrix Component implementieren
- [ ] Question Component implementieren
- [ ] WebSocket Client für Game Events
- [ ] Game View State Management
- [ ] TV-optimiertes Design

### Agent 2 (Admin View)
- [ ] Mini Matrix Component
- [ ] Player Dashboard
- [ ] Score Controls
- [ ] Admin Authentication
- [ ] API Routes für Game Control
- [ ] WebSocket Client für Admin Events

### Agent 3 (Player View)
- [ ] Login Component
- [ ] Scoreboard Component
- [ ] Buzzer Component
- [ ] Player Registration API
- [ ] WebSocket Client für Player Events
- [ ] Mobile-optimiertes Design

## 🎉 Zusammenfassung

**Die Struktur ermöglicht:**
- ✅ Vollständig unabhängige Agent-Arbeit
- ✅ Keine Merge-Konflikte zwischen Agents
- ✅ SOLID-konforme Architektur
- ✅ Einfaches Testing (Mocking über Interfaces)
- ✅ Erweiterbarkeit ohne Modifikation bestehender Bereiche

**Jeder Agent kann:**
- In seinem Bereich arbeiten ohne andere zu stören
- Shared Types/Interfaces nutzen
- Eigene Components/Services erstellen
- API Routes implementieren
- WebSocket Events senden/empfangen

