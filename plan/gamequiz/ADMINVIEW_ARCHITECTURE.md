# Admin View Architektur

## 🎛️ Übersicht

Die **Admin View** ist die Steuerzentrale für den Moderator (iPad). Sie bietet vollständige Kontrolle über den Spielablauf, Spieler-Management und Score-Verwaltung.

---

## 📱 Views

### 1. **Dashboard View** (Hauptansicht)

**Zweck:** Zentrale Übersicht mit Mini-Matrix, Spieler-Dashboard und Kontroll-Panel

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  🎄 ADMIN CONTROL PANEL 🎄                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │              │  │  👥 SPIELER                  │   │
│  │   MINI       │  │  ┌────────────────────────┐  │   │
│  │   MATRIX     │  │  │ Max      │ 300  │ ✅  │  │   │
│  │              │  │  ├────────────────────────┤  │   │
│  │  [Klickbare] │  │  │ Anna     │ 200  │ ✅  │  │   │
│  │   Zellen     │  │  ├────────────────────────┤  │   │
│  │              │  │  │ Tom      │ 100  │ ✅  │  │   │
│  └──────────────┘  │  └────────────────────────┘  │   │
│                    │                               │   │
│                    │  🔔 BUZZER-QUEUE:             │   │
│                    │  1. Max (0.23s)               │   │
│                    │  2. Anna (0.45s)              │   │
│                    │                               │   │
│                    │  ┌────────────────────────┐  │   │
│                    │  │ 🎯 AKTUELLE FRAGE      │  │   │
│                    │  │                        │  │   │
│                    │  │ Kategorie: Weihnachten │  │   │
│                    │  │ Wert: 300              │  │   │
│                    │  │                        │  │   │
│                    │  │ [Antwort Revealen]     │  │   │
│                    │  └────────────────────────┘  │   │
│                    │                               │   │
│                    │  ┌────────────────────────┐  │   │
│                    │  │ 📊 SCORE-VERGABE       │  │   │
│                    │  │                        │  │   │
│                    │  │ Max:  [+300] [-300]     │  │   │
│                    │  │ Anna: [+300] [-300]    │  │   │
│                    │  │ Tom:  [+300] [-300]    │  │   │
│                    │  │                        │  │   │
│                    │  │ [Zurück zur Matrix]    │  │   │
│                    │  └────────────────────────┘  │   │
│                    └──────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Layout-Struktur:**
- **Linke Spalte (40%):** Mini-Matrix (interaktiv, klickbar)
- **Rechte Spalte (60%):** Dashboard mit Spielern, Buzzer-Queue, Controls

---

## 🧩 Komponenten

### **MiniMatrixComponent**

**Props:**
```typescript
interface MiniMatrixProps {
  categories: Category[];
  pointValues: number[];
  matrix: MatrixCell[][];
  onCellClick: (category: number, points: number) => void;
}
```

**Features:**
- Kompakte Version der Game View Matrix
- Alle Zellen sind klickbar (nicht read-only)
- Visual Feedback beim Hover
- State-Indikatoren (available/selected/completed)
- Touch-optimiert für iPad

**CSS:**
```css
.mini-matrix {
  display: grid;
  grid-template-columns: repeat(var(--categories), 1fr);
  grid-template-rows: repeat(var(--point-values), 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(15, 20, 25, 0.5);
  border-radius: 12px;
}

.mini-matrix-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: clamp(0.75rem, 2vw, 1.25rem);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation; /* iPad-optimiert */
}

.mini-matrix-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.mini-matrix-cell.selected {
  border: 3px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}
```

---

### **PlayerDashboardComponent**

**Props:**
```typescript
interface PlayerDashboardProps {
  players: Player[];
  onScoreUpdate: (playerId: string, delta: number) => void;
}
```

**Features:**
- Liste aller registrierten Spieler
- Sortiert nach Punkten (höchste zuerst)
- Score-Buttons für jeden Spieler (+/-)
- Visual Indicator für aktiven Spieler (wer darf antworten)
- Real-time Updates via WebSocket

**Layout:**
```html
<div class="player-list">
  {#each sortedPlayers as player (player.id)}
    <div class="player-card" class:active={player.id === activePlayerId}>
      <div class="player-info">
        <span class="player-name">{player.name}</span>
        <span class="player-score">{player.score}</span>
      </div>
      <div class="score-controls">
        <button on:click={() => updateScore(player.id, +question.points)}>
          +{question.points}
        </button>
        <button on:click={() => updateScore(player.id, -question.points)}>
          -{question.points}
        </button>
      </div>
    </div>
  {/each}
</div>
```

**CSS:**
```css
.player-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.player-card.active {
  border-left-color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.score-controls button {
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.score-controls button:first-child {
  background: linear-gradient(135deg, #228B22, #32CD32);
}

.score-controls button:last-child {
  background: linear-gradient(135deg, #DC143C, #FF6347);
}
```

---

### **BuzzerQueueComponent**

**Props:**
```typescript
interface BuzzerQueueProps {
  entries: BuzzerEntry[];
  onSelectPlayer: (playerId: string) => void;
}
```

**Features:**
- Zeigt Buzzer-Reihenfolge nach Reaktionszeit
- Klickbar: Admin kann Spieler auswählen (wer darf antworten)
- Highlight für ausgewählten Spieler
- Auto-Update bei neuen Buzzes

**Interaktion:**
- Admin klickt auf Spieler → Dieser wird als "active" markiert
- Score-Buttons werden für diesen Spieler prominent angezeigt
- Nach Score-Vergabe: Zurück zur Matrix möglich

---

### **QuestionControlComponent**

**Props:**
```typescript
interface QuestionControlProps {
  selectedQuestion: Question | null;
  answerRevealed: boolean;
  onRevealAnswer: () => void;
  onReturnToMatrix: () => void;
}
```

**Features:**
- Zeigt aktuelle Frage (wenn ausgewählt)
- Button zum Revealen der Antwort
- Button zum Zurückkehren zur Matrix
- Disabled States (z.B. "Reveal Answer" nur wenn Frage aktiv)

**Layout:**
```html
<div class="question-control">
  {#if selectedQuestion}
    <div class="question-info">
      <h3>{selectedQuestion.category}</h3>
      <p class="points">💰 {selectedQuestion.points}</p>
      <p class="question-text">{selectedQuestion.question}</p>
      
      {#if answerRevealed}
        <div class="answer">
          <strong>✅ Antwort:</strong>
          <p>{selectedQuestion.answer}</p>
        </div>
      {/if}
    </div>
    
    <div class="control-buttons">
      {#if !answerRevealed}
        <button on:click={revealAnswer} class="btn-reveal">
          Antwort Revealen
        </button>
      {/if}
      
      {#if answerRevealed}
        <button on:click={returnToMatrix} class="btn-return">
          Zurück zur Matrix
        </button>
      {/if}
    </div>
  {:else}
    <p class="no-question">Keine Frage ausgewählt</p>
  {/if}
</div>
```

---

### **GameManagementComponent** (Optional, für Setup)

**Zweck:** Frage-Management vor dem Spiel

**Features:**
- Upload CSV/JSON mit Fragen
- Manuelle Frage-Erstellung
- Kategorie-Verwaltung
- Matrix-Konfiguration (Anzahl Kategorien, Punktewerte)

**Endpoints:**
- `POST /api/questions/upload` - CSV/JSON Upload
- `POST /api/questions` - Neue Frage erstellen
- `GET /api/questions` - Alle Fragen laden
- `DELETE /api/questions/:id` - Frage löschen

---

## 🔌 Backend Endpoints

### **Game Control:**

```typescript
// Frage auswählen (sendet Event an Game View)
POST /api/game/select-question
Body: {
  categoryIndex: number;
  pointValue: number;
}
Response: {
  question: Question;
  success: boolean;
}

// Antwort revealen
POST /api/game/reveal-answer
Response: {
  answer: string;
  success: boolean;
}

// Zurück zur Matrix
POST /api/game/return-to-matrix
Response: {
  success: boolean;
}
```

### **Score Management:**

```typescript
// Score aktualisieren
POST /api/players/:playerId/score
Body: {
  delta: number; // +300 oder -300
}
Response: {
  playerId: string;
  newScore: number;
  success: boolean;
}

// Score zurücksetzen (optional, für neues Spiel)
POST /api/game/reset-scores
Response: {
  success: boolean;
}
```

### **Player Management:**

```typescript
// Alle Spieler abrufen
GET /api/players
Response: {
  players: Player[];
}

// Spieler entfernen (optional)
DELETE /api/players/:playerId
Response: {
  success: boolean;
}

// Buzzer-Queue abrufen
GET /api/game/buzzer-queue
Response: {
  entries: BuzzerEntry[];
}
```

### **Question Management:**

```typescript
// Fragen hochladen (CSV/JSON)
POST /api/questions/upload
Body: FormData (file)
Response: {
  imported: number;
  errors: string[];
}

// Alle Fragen abrufen
GET /api/questions
Response: {
  questions: Question[];
}

// Frage erstellen
POST /api/questions
Body: {
  category: string;
  points: number;
  question: string;
  answer: string;
}
Response: {
  question: Question;
  success: boolean;
}
```

---

## 🔐 Authentifizierung

### **Token-basierte Auth:**

```typescript
// Admin View Route: /admin?token=SECRET_TOKEN
// Server prüft Token in API Routes

// Middleware:
function requireAdmin(request: Request) {
  const token = request.headers.get('X-Admin-Token') || 
                new URL(request.url).searchParams.get('token');
  
  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    throw new Error('Unauthorized');
  }
}
```

**Environment Variable:**
```bash
ADMIN_SECRET_TOKEN=your-super-secret-token-here
```

---

## 📊 State Management

### **Svelte Stores:**

```typescript
// adminState.ts
import { writable, derived } from 'svelte/store';
import { gameState } from './gameState';

export const selectedCell = writable<{category: number, points: number} | null>(null);
export const answerRevealed = writable<boolean>(false);
export const activePlayerId = writable<string | null>(null);

// Derived: Aktuelle Frage
export const currentQuestion = derived(
  [gameState, selectedCell],
  ([$gameState, $selectedCell]) => {
    if (!$selectedCell) return null;
    return $gameState.matrix[$selectedCell.category][$selectedCell.points]?.question;
  }
);
```

---

## 🎨 Design-Details

### **iPad-optimiert:**

```css
:root {
  --admin-panel-width: min(90vw, 1200px);
  --admin-mini-matrix-size: 40%;
  --admin-dashboard-size: 60%;
}

@media (max-width: 768px) {
  /* Fallback für kleinere Tablets */
  --admin-mini-matrix-size: 100%;
  --admin-dashboard-size: 100%;
  /* Stack Layout statt Side-by-Side */
}
```

### **Touch-optimierte Buttons:**

```css
.admin-button {
  min-height: 44px; /* Apple HIG: min 44x44px für Touch */
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 8px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

### **Weihnachtliche Akzente:**

```css
.admin-panel {
  background: linear-gradient(
    135deg,
    rgba(15, 20, 25, 0.95) 0%,
    rgba(34, 139, 34, 0.1) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## 🔄 WebSocket Events

### **Gesendete Events:**

```typescript
// Frage auswählen
ws.send(JSON.stringify({
  type: 'admin:select-question',
  payload: {
    categoryIndex: number;
    pointValue: number;
  }
}));

// Antwort revealen
ws.send(JSON.stringify({
  type: 'admin:reveal-answer'
}));

// Score aktualisieren
ws.send(JSON.stringify({
  type: 'admin:update-score',
  payload: {
    playerId: string;
    delta: number;
  }
}));

// Zurück zur Matrix
ws.send(JSON.stringify({
  type: 'admin:return-to-matrix'
}));
```

### **Empfangene Events:**

```typescript
// Buzzer wurde gedrückt
{
  type: 'player:buzzed',
  payload: {
    playerId: string;
    playerName: string;
    reactionTime: number;
  }
}

// Spieler hat sich registriert
{
  type: 'player:registered',
  payload: {
    player: Player;
  }
}

// State Sync
{
  type: 'state:sync',
  payload: GameState
}
```

---

## 🚀 Performance-Optimierungen

1. **Debounced Score Updates:**
   - Nicht jedes Klick sendet sofort Event
   - Batch Updates für mehrere Score-Änderungen

2. **Optimistic UI:**
   - Score-Buttons zeigen sofort Update
   - Rollback bei Fehler

3. **Lazy Loading:**
   - Question Management nur wenn benötigt
   - Minimale Initial Load

---

## 📱 Responsive Design

### **iPad Portrait (768x1024):**
- Side-by-Side Layout
- Mini-Matrix links, Dashboard rechts

### **iPad Landscape (1024x768):**
- Größere Mini-Matrix
- Mehr Platz für Player-Liste

### **Fallback (kleinere Displays):**
- Stack Layout (Matrix oben, Dashboard unten)
- Scrollbare Bereiche

---

## ✅ Checkliste

- [ ] Dashboard View Layout
- [ ] Mini-Matrix Component (klickbar)
- [ ] Player Dashboard mit Score-Controls
- [ ] Buzzer-Queue Display
- [ ] Question Control Panel
- [ ] WebSocket Integration
- [ ] Admin Authentication
- [ ] Score Update Logic
- [ ] Return-to-Matrix Control
- [ ] iPad Touch-Optimierung
- [ ] Error Handling
- [ ] Loading States
- [ ] Question Management (Optional)

