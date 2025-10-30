# Server Services

## Struktur

Hier werden die Server-seitigen Services implementiert:
- GameStateService (implementiert IGameStateService)
- QuestionRepository (implementiert IQuestionRepository)
- PlayerRepository (implementiert IPlayerRepository)

## SOLID-Prinzipien

- Alle Services implementieren die Interfaces aus `src/lib/shared/interfaces/`
- Dependency Inversion: Services können ausgetauscht werden
- Single Responsibility: Jeder Service hat eine klare Aufgabe

