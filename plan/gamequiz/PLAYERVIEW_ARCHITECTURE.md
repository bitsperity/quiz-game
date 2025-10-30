# Player View Architektur

## 📱 Übersicht

Die **Player View** ist die mobile-first Ansicht für Spieler auf ihren Smartphones. Fokus liegt auf schneller Reaktionszeit, klarer Score-Anzeige und intuitivem Buzzer-Button.

---

## 📱 Views

### 1. **Login View** (Einstieg)

**Zweck:** Spieler gibt Namen ein und registriert sich

**Layout:**
```
┌─────────────────────────────────┐
│                                 │
│      🎄 WEIHNACHTS-QUIZ 🎄      │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   Gib deinen Namen ein:   │  │
│  │                           │  │
│  │  ┌─────────────────────┐  │  │
│  │  │                     │  │  │
│  │  └─────────────────────┘  │  │
│  │                           │  │
│  │     [🚀 Spielen]           │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Features:**
- Einfaches Eingabefeld für Namen
- Validierung (min. 2 Zeichen, max. 20)
- Duplikat-Check (warnen wenn Name bereits existiert)
- Auto-Focus auf Input
- Enter-Taste triggert Submit

**Mobile-Optimierungen:**
- Virtual Keyboard wird korrekt angezeigt
- Input ist type="text" (kein Autocorrect)
- Touch-optimierter Button (min. 44px Höhe)

---

### 2. **Game View** (Hauptansicht)

**Zweck:** Scoreboard + Buzzer-Button

**Layout:**
```
┌─────────────────────────────────┐
│  🎄 WEIHNACHTS-QUIZ 🎄          │
├─────────────────────────────────┤
│                                 │
│  📊 PUNKTESTAND:                │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🥇 Max        │  300     │  │
│  ├───────────────────────────┤  │
│  │ 🥈 Anna       │  200     │  │
│  ├───────────────────────────┤  │
│  │ 🥉 Tom        │  100     │  │
│  ├───────────────────────────┤  │
│  │    Du (Max)   │  300  ⭐ │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │                           │  │
│  │     🎅 BUZZER 🎅          │  │
│  │                           │  │
│  │   (Nur wenn Frage aktiv)  │  │
│  │                           │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  💡 Warte auf Frage...          │
│                                 │
└─────────────────────────────────┘
```

**Layout-Struktur:**
- **Header (20%):** Spielername + Logo
- **Scoreboard (40%):** Alle Spieler sortiert nach Punkten
- **Buzzer Area (40%):** Großer, prominenter Button

---

## 🧩 Komponenten

### **LoginComponent**

**Props:**
```typescript
interface LoginProps {
  onSubmit: (name: string) => Promise<void>;
}
```

**Features:**
- Name-Input mit Validierung
- Duplikat-Warnung
- Loading State während Registration
- Error Handling (z.B. Server nicht erreichbar)
- Auto-Redirect nach erfolgreicher Registration

**Code-Struktur:**
```svelte
<script lang="ts">
  let playerName = '';
  let error = '';
  let loading = false;
  
  async function handleSubmit() {
    if (playerName.length < 2) {
      error = 'Name muss mindestens 2 Zeichen lang sein';
      return;
    }
    
    loading = true;
    try {
      await onSubmit(playerName);
      // Redirect to Game View
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>
```

**CSS:**
```css
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0F1419 0%, #1a2332 100%);
}

.login-input {
  width: 100%;
  max-width: 300px;
  padding: 1rem;
  font-size: 1.25rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #FFF8DC;
  text-align: center;
}

.login-button {
  margin-top: 1rem;
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: bold;
  background: linear-gradient(135deg, #DC143C, #FF6347);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  min-height: 44px;
  touch-action: manipulation;
}
```

---

### **ScoreboardComponent**

**Props:**
```typescript
interface ScoreboardProps {
  players: Player[];
  currentPlayerId: string;
}
```

**Features:**
- Sortiert nach Punkten (höchste zuerst)
- Highlight für eigenen Spieler
- Medaillen-Icons für Top 3 (🥇🥈🥉)
- Smooth Updates bei Score-Änderungen
- Animierte Score-Änderungen (Pulse-Effekt)

**Layout:**
```html
<div class="scoreboard">
  {#each sortedPlayers as player, index (player.id)}
    <div class="scoreboard-entry" 
         class:current-player={player.id === currentPlayerId}
         class:top-three={index < 3}>
      <span class="rank">{getRankIcon(index)}</span>
      <span class="name">{player.name}</span>
      <span class="score">{player.score}</span>
      {#if player.id === currentPlayerId}
        <span class="you-badge">⭐ Du</span>
      {/if}
    </div>
  {/each}
</div>
```

**CSS:**
```css
.scoreboard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.scoreboard-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.scoreboard-entry.current-player {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
  border: 2px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.scoreboard-entry.top-three {
  font-weight: bold;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFD700;
}

@keyframes scoreUpdate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.scoreboard-entry.updating .score {
  animation: scoreUpdate 0.5s ease;
}
```

---

### **BuzzerComponent**

**Props:**
```typescript
interface BuzzerProps {
  enabled: boolean; // Nur aktiv wenn Frage revealed
  onPress: () => void;
  buzzed: boolean; // Hat dieser Spieler bereits gebuzzt?
  position: number | null; // Position in Queue (1, 2, 3...)
}
```

**Features:**
- Großer, prominenter Button (fast Fullscreen auf Mobile)
- Weihnachtliches Design (z.B. Schneeflocke, Weihnachtsmann-Icon)
- Disabled State wenn keine Frage aktiv
- Visual Feedback beim Press (Haptic Feedback auf Mobile)
- Zeigt Position in Queue nach dem Buzz
- Animation beim Klick

**Layout:**
```html
<div class="buzzer-container">
  {#if !enabled}
    <div class="buzzer-disabled">
      <p>💡 Warte auf Frage...</p>
    </div>
  {:else if buzzed}
    <div class="buzzer-buzzed">
      <h2>🔔 Du hast gebuzzt!</h2>
      {#if position}
        <p class="position">Position: #{position}</p>
      {/if}
    </div>
  {:else}
    <button 
      class="buzzer-button"
      on:click={handlePress}
      on:touchstart={handlePress}
    >
      <span class="buzzer-icon">🎅</span>
      <span class="buzzer-text">BUZZER</span>
    </button>
  {/if}
</div>
```

**CSS:**
```css
.buzzer-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.buzzer-button {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #DC143C 0%, #FF6347 100%);
  box-shadow: 0 8px 32px rgba(220, 20, 60, 0.4);
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.buzzer-button:active {
  transform: scale(0.95);
  box-shadow: 0 4px 16px rgba(220, 20, 60, 0.6);
}

.buzzer-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.buzzer-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.buzzer-disabled {
  text-align: center;
  color: rgba(255, 248, 220, 0.5);
  font-size: 1.25rem;
}

.buzzer-buzzed {
  text-align: center;
  color: #FFD700;
}

.buzzer-buzzed h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.position {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Weihnachtliche Animation */
@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.buzzer-button:hover .buzzer-icon {
  animation: sparkle 1s infinite;
}
```

---

### **StatusIndicatorComponent** (Optional)

**Zweck:** Zeigt aktuellen Spiel-Status

**States:**
- "Warte auf Frage..." (Matrix View)
- "Frage wird gestellt..." (Question View)
- "Antwort wird gezeigt..." (Answer View)

---

## 🔌 Backend Endpoints

### **Player Registration:**

```typescript
// Spieler registrieren
POST /api/players/register
Body: {
  name: string;
}
Response: {
  player: {
    id: string;
    name: string;
    score: number;
  };
  success: boolean;
}

// Spieler-Info abrufen
GET /api/players/:playerId
Response: {
  player: Player;
}
```

### **Buzzer:**

```typescript
// Buzzer drücken
POST /api/game/buzz
Headers: {
  X-Player-ID: string; // Oder via Cookie/Session
}
Body: {
  timestamp: number; // Client-Timestamp (optional)
}
Response: {
  success: boolean;
  position: number; // Position in Queue (1, 2, 3...)
  reactionTime: number; // ms
}

// Buzzer-Status abrufen
GET /api/game/buzzer-status
Response: {
  enabled: boolean; // Ist Buzzer aktiv?
  questionActive: boolean;
  buzzed: boolean; // Hat dieser Spieler gebuzzt?
  position: number | null;
}
```

### **Game State:**

```typescript
// Aktuellen State abrufen
GET /api/game/state
Response: {
  currentView: 'matrix' | 'question' | 'answer';
  questionActive: boolean;
  answerRevealed: boolean;
  players: Player[];
}
```

---

## 🔄 WebSocket Events

### **Empfangene Events:**

```typescript
// Frage wurde ausgewählt (Buzzer aktivieren)
{
  type: 'game:question-selected',
  payload: {
    questionId: string;
    category: string;
    points: number;
  }
}

// Antwort wurde revealed (Buzzer deaktivieren)
{
  type: 'game:answer-revealed'
}

// Buzzer wurde gedrückt (Update Queue)
{
  type: 'player:buzzed',
  payload: {
    playerId: string;
    playerName: string;
    position: number;
    reactionTime: number;
  }
}

// Score wurde aktualisiert
{
  type: 'player:score-updated',
  payload: {
    playerId: string;
    newScore: number;
    delta: number;
  }
}

// Zurück zur Matrix (Buzzer-Queue zurücksetzen)
{
  type: 'game:return-to-matrix'
}

// State Sync (bei Connect)
{
  type: 'state:sync',
  payload: GameState
}
```

### **Gesendete Events:**

```typescript
// Buzzer drücken
ws.send(JSON.stringify({
  type: 'player:buzz',
  payload: {
    timestamp: Date.now()
  }
}));
```

---

## 🎨 Design-Details

### **Mobile-First:**

```css
:root {
  --player-view-padding: 1rem;
  --player-scoreboard-height: 40vh;
  --player-buzzer-height: 60vh;
}

@media (orientation: landscape) {
  /* Landscape-Modus: Scoreboard oben, Buzzer unten */
  --player-scoreboard-height: 30vh;
  --player-buzzer-height: 70vh;
}
```

### **Weihnachtliche Farbpalette:**

```css
:root {
  --color-player-bg: linear-gradient(135deg, #0F1419 0%, #1a2332 100%);
  --color-buzzer-active: linear-gradient(135deg, #DC143C 0%, #FF6347 100%);
  --color-buzzer-disabled: rgba(255, 255, 255, 0.1);
  --color-score-highlight: #FFD700;
  --color-current-player: rgba(255, 215, 0, 0.2);
}
```

### **Touch-Optimierungen:**

```css
/* Große Touch-Targets */
button, .buzzer-button {
  min-height: 44px;
  min-width: 44px;
}

/* Kein Text-Selection auf Buttons */
button {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Haptic Feedback Simulation */
.buzzer-button:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}
```

---

## 📊 State Management

### **Svelte Stores:**

```typescript
// playerState.ts
import { writable } from 'svelte/store';

export interface PlayerState {
  playerId: string | null;
  playerName: string | null;
  loggedIn: boolean;
  buzzerEnabled: boolean;
  buzzed: boolean;
  buzzerPosition: number | null;
}

export const playerState = writable<PlayerState>({
  playerId: null,
  playerName: null,
  loggedIn: false,
  buzzerEnabled: false,
  buzzed: false,
  buzzerPosition: null
});

// gameState.ts (shared)
export const gameState = writable<GameState>({
  players: [],
  currentView: 'matrix',
  selectedQuestion: null
});
```

---

## 🚀 Performance-Optimierungen

1. **Minimaler JavaScript Bundle:**
   - Nur notwendige Dependencies
   - Code-Splitting für Login/Game Views

2. **Optimistic UI:**
   - Buzzer-Button zeigt sofort Feedback
   - Score-Updates ohne Warten auf Server

3. **Debounced WebSocket:**
   - Nicht jedes Event triggert Re-Render
   - Batch Updates für Score-Änderungen

4. **CSS-only Animations:**
   - Keine JavaScript für Transitions
   - GPU-accelerated transforms

---

## 📱 Responsive Design

### **Portrait (Smartphone):**
- Scoreboard oben (40%)
- Buzzer unten (60%)
- Full-Width Layout

### **Landscape (Smartphone):**
- Scoreboard oben (30%)
- Buzzer unten (70%)
- Optimiert für horizontale Ausrichtung

### **Breakpoints:**
```css
@media (max-width: 480px) {
  /* Kleine Smartphones */
  --player-view-padding: 0.5rem;
  --buzzer-icon-size: 3rem;
}

@media (min-width: 481px) and (max-width: 768px) {
  /* Große Smartphones / Kleine Tablets */
  --buzzer-icon-size: 4rem;
}
```

---

## 🔐 Session Management

### **LocalStorage für Player-ID:**

```typescript
// Nach erfolgreicher Registration
localStorage.setItem('playerId', player.id);
localStorage.setItem('playerName', player.name);

// Bei Page Reload
const savedPlayerId = localStorage.getItem('playerId');
if (savedPlayerId) {
  // Auto-Login
}
```

**Vorteile:**
- Spieler bleibt eingeloggt bei Page Reload
- Keine erneute Registrierung nötig
- Einfache Session-Verwaltung

---

## ✅ Checkliste

- [ ] Login View mit Name-Input
- [ ] Registration Endpoint
- [ ] Game View Layout
- [ ] Scoreboard Component
- [ ] Buzzer Component
- [ ] WebSocket Integration
- [ ] Buzzer-Enabled State Management
- [ ] Position in Queue Anzeige
- [ ] Mobile Touch-Optimierung
- [ ] Weihnachtliches Design
- [ ] Haptic Feedback (optional)
- [ ] Error Handling
- [ ] Loading States
- [ ] Session Persistence
- [ ] Auto-Reconnect bei Connection Loss

