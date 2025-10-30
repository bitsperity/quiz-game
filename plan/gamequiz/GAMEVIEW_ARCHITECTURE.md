# Game View Architektur

## 🎮 Übersicht

Die **Game View** ist die Hauptanzeige auf dem TV und zeigt den aktuellen Spielzustand allen Zuschauern. Sie ist primär **read-only** und reagiert auf Commands vom Admin.

---

## 📱 Views

### 1. **Matrix View** (Standard-Ansicht)

**Zweck:** Zeigt die Quiz-Matrix mit Kategorien und Punktewerten

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        🎄 WEIHNACHTS-QUIZ 🎄                       │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │Kat 1 │ │Kat 2 │ │Kat 3 │ │Kat 4 │ │Kat 5 │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ 100  │ │ 100  │ │ 100  │ │ 100  │ │ 100  │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ 200  │ │ 200  │ │ 200  │ │ 200  │ │ 200  │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ 300  │ │ 300  │ │ 300  │ │ 300  │ │ 300  │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ 400  │ │ 400  │ │ 400  │ │ 400  │ │ 400  │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ 500  │ │ 500  │ │ 500  │ │ 500  │ │ 500  │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Zustände der Zellen:**
- `available` - Zeigt Punktewert (normal)
- `selected` - Wird gerade gespielt (Glowing-Effekt)
- `completed` - Bereits gespielt (grau, durchgestrichen)

**Visuelle Features:**
- Große, lesbare Schrift (min. 48px)
- Weihnachtliche Farben: Rot/Grün/Gold Akzente
- Hover-Effekt auf verfügbaren Zellen (optional)
- Smooth Transitions beim State-Wechsel

---

### 2. **Question View** (Frage wird angezeigt)

**Zweck:** Zeigt die ausgewählte Frage prominent an

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           🎄 KATEGORIE: Weihnachten 🎄              │
│                                                     │
│           ┌─────────────────────────┐              │
│           │                         │              │
│           │    FRAGE TEXT           │              │
│           │    (Groß, zentriert)    │              │
│           │                         │              │
│           └─────────────────────────┘              │
│                                                     │
│                  💰 WERT: 300                      │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │  🔔 BUZZER-QUEUE:                       │       │
│  │  1. Max (0.23s)                         │       │
│  │  2. Anna (0.45s)                        │       │
│  │  3. Tom (0.67s)                         │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Großformatige Frage-Anzeige
- Kategorie & Punktewert sichtbar
- Buzzer-Queue zeigt Reaktionszeiten
- Countdown-Timer (optional, z.B. 30 Sekunden)

**Animations:**
- Fade-in der Frage
- Buzzer-Entries slide-in von rechts
- Smooth Scrolling für lange Fragen

---


## 🧩 Komponenten

### **MatrixComponent**

**Props:**
```typescript
interface MatrixProps {
  categories: Category[];
  pointValues: number[];
  matrix: MatrixCell[][];
  onCellClick?: (category: number, points: number) => void; // Read-only, nicht genutzt
}
```

**Features:**
- CSS Grid Layout für Matrix
- Responsive Größenanpassung
- Cell-State-Management (available/selected/completed)
- Animations für State-Transitions

**CSS-Strategie:**
```css
.matrix-grid {
  display: grid;
  grid-template-columns: repeat(var(--categories), 1fr);
  grid-template-rows: repeat(var(--point-values), 1fr);
  gap: 1rem;
  padding: 2rem;
}

.matrix-cell {
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: default; /* Read-only */
}

.matrix-cell.available {
  background: linear-gradient(135deg, #DC143C 0%, #FF6347 100%);
  box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);
}

.matrix-cell.selected {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  animation: pulse 1s infinite;
}

.matrix-cell.completed {
  background: #2a2a2a;
  opacity: 0.5;
  text-decoration: line-through;
}
```

---

### **QuestionComponent**

**Props:**
```typescript
interface QuestionProps {
  question: Question;
  buzzerQueue: BuzzerEntry[];
  showAnswer: boolean;
}
```

**Features:**
- Große, lesbare Frage-Anzeige
- Buzzer-Queue mit Reaktionszeiten
- Antwort-Reveal mit Animation
- Kategorie & Punktewert Badge

**Layout:**
- Fullscreen oder zentriert mit Padding
- Responsive Font-Sizing (clamp)
- Scrollbar für sehr lange Fragen

---

### **BuzzerQueueComponent**

**Props:**
```typescript
interface BuzzerQueueProps {
  entries: BuzzerEntry[];
  maxVisible?: number; // Default: 5
}
```

**Features:**
- Sortiert nach Reaktionszeit (schnellste zuerst)
- Animiertes Slide-in für neue Einträge
- Zeigt Spielername + Reaktionszeit
- Highlight für Erstplatzierten (Gold)

**Animations:**
```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.buzzer-entry {
  animation: slideInRight 0.3s ease-out;
}
```

---

### **ScoreDisplayComponent** (Optional, in Answer View)

**Props:**
```typescript
interface ScoreDisplayProps {
  scoreUpdates: ScoreUpdate[];
}
```

**Features:**
- Zeigt Score-Änderungen während Answer View
- Positive Scores: Grün, Pfeil nach oben
- Negative Scores: Rot, Pfeil nach unten
- Fade-out nach 3 Sekunden

---

## 🔌 WebSocket Events

### **Empfangene Events:**

```typescript
// Frage wurde ausgewählt
{
  type: 'game:question-selected',
  payload: {
    questionId: string;
    category: string;
    points: number;
    question: string;
  }
}

// Antwort wurde revealed
{
  type: 'game:answer-revealed',
  payload: {
    answer: string;
  }
}

// Zurück zur Matrix
{
  type: 'game:return-to-matrix'
}

// Buzzer wurde gedrückt
{
  type: 'player:buzzed',
  payload: {
    playerId: string;
    playerName: string;
    reactionTime: number; // ms
  }
}

// Score wurde aktualisiert
{
  type: 'player:score-updated',
  payload: {
    playerId: string;
    playerName: string;
    newScore: number;
    delta: number; // +300 oder -300
  }
}

// Vollständiger State Sync (bei Connect)
{
  type: 'state:sync',
  payload: {
    currentView: 'matrix' | 'question' | 'answer';
    selectedQuestion: Question | null;
    players: Player[];
    buzzerQueue: BuzzerEntry[];
    matrix: MatrixCell[][];
  }
}
```

---

## 🎨 Design-Details

### **Weihnachtliche Farbpalette:**

```css
:root {
  --color-christmas-red: #DC143C;
  --color-christmas-green: #228B22;
  --color-christmas-gold: #FFD700;
  --color-dark-bg: #0F1419;
  --color-light-text: #FFF8DC;
  --color-matrix-available: linear-gradient(135deg, #DC143C 0%, #FF6347 100%);
  --color-matrix-selected: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  --color-matrix-completed: #2a2a2a;
}
```

### **Typografie:**

```css
:root {
  --font-display: 'Georgia', serif; /* Elegant für Headlines */
  --font-body: 'Inter', system-ui, sans-serif; /* Lesbar für Fragen */
  --font-size-matrix: clamp(2rem, 5vw, 4rem);
  --font-size-question: clamp(2.5rem, 6vw, 5rem);
  --font-size-answer: clamp(2rem, 5vw, 4rem);
}
```

### **Animations:**

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sparkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📊 State Management

### **Svelte Store: `gameState.ts`**

```typescript
import { writable } from 'svelte/store';

export interface GameState {
  currentView: 'matrix' | 'question' | 'answer';
  selectedQuestion: Question | null;
  buzzerQueue: BuzzerEntry[];
  players: Player[];
  matrix: MatrixCell[][];
}

export const gameState = writable<GameState>({
  currentView: 'matrix',
  selectedQuestion: null,
  buzzerQueue: [],
  players: [],
  matrix: []
});
```

**WebSocket Handler:**
```typescript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'game:question-selected':
      gameState.update(state => ({
        ...state,
        currentView: 'question',
        selectedQuestion: message.payload
      }));
      break;
    // ... weitere Cases
  }
};
```

---

## 🚀 Performance-Optimierungen

1. **Lazy Loading:**
   - Question/Answer Views werden nur geladen wenn nötig
   - Matrix bleibt im DOM (schneller Wechsel zurück)

2. **CSS-only Animations:**
   - Keine JavaScript-Animationen für Transitions
   - GPU-accelerated transforms

3. **Debounced Updates:**
   - Buzzer-Queue Updates werden gebatched
   - Nicht jedes einzelne Buzz triggert Re-Render

4. **Virtual Scrolling** (falls viele Spieler):
   - Buzzer-Queue: Nur sichtbare Einträge rendern

---

## 📱 Responsive Design

### **TV-Optimiert (1920x1080+)**

- Große Schriftgrößen
- Maximale Lesbarkeit aus 3-5m Entfernung
- Hoher Kontrast
- Keine kleinen UI-Elemente

### **Fallback für kleinere Displays:**

```css
@media (max-width: 1920px) {
  :root {
    --font-size-matrix: clamp(1.5rem, 4vw, 3rem);
    --font-size-question: clamp(2rem, 5vw, 4rem);
  }
}
```

---

## 🔄 View-Transitions

### **Smooth Transitions zwischen Views:**

```typescript
// SvelteKit View Transitions API
import { fly } from 'svelte/transition';

// Matrix → Question
function transitionToQuestion() {
  // Fade out Matrix
  // Fly in Question from bottom
}

// Question → Answer
function revealAnswer() {
  // Slide down Answer section
  // Highlight mit Gold-Gradient
}
```

---

## ✅ Checkliste

- [ ] Matrix View mit Grid Layout
- [ ] Question View mit großer Anzeige
- [ ] Answer View mit Highlight
- [ ] WebSocket Integration
- [ ] Buzzer-Queue Component
- [ ] Score Updates Display
- [ ] Weihnachtliches Design
- [ ] Responsive für TV
- [ ] Smooth Animations
- [ ] State Management Store
- [ ] Error Handling (Connection Lost)
- [ ] Loading States

