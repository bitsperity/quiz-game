# Agent 3: Player View Bereich

## Verantwortlichkeiten
- Login Component
- Scoreboard Component
- Buzzer Component
- Player Registration
- Mobile-optimiertes Design

## Unabhängigkeit
- Kann unabhängig von Game und Admin View entwickelt werden
- Nutzt nur Shared Types und Interfaces
- Kommuniziert über WebSocket Events

## Struktur
```
player-view/
  components/
    Login.svelte
    Scoreboard.svelte
    Buzzer.svelte
  stores/
    playerState.ts
  services/
    playerWebSocket.ts
    playerAuth.ts
```

