# Agent 1: Game View Bereich

## Verantwortlichkeiten
- Game View Komponenten (Matrix, Question Display)
- WebSocket Client für Game View Events
- Game View State Management
- TV-optimiertes Design

## Unabhängigkeit
- Kann unabhängig von Admin und Player View entwickelt werden
- Nutzt nur Shared Types und Interfaces
- Keine direkten Abhängigkeiten zu anderen Views

## Struktur
```
game-view/
  components/
    Matrix.svelte
    Question.svelte
    BuzzerQueue.svelte
  stores/
    gameViewState.ts
  services/
    gameViewWebSocket.ts
```

