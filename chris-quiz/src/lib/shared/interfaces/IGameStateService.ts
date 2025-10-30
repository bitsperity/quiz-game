/**
 * Interface für Game State Service
 * SOLID-Prinzip: Dependency Inversion - Abhängigkeiten über Interfaces
 */
import type { GameState, Question, Player, BuzzerEntry } from '../types';

export interface IGameStateService {
	getState(): GameState;
	selectQuestion(categoryIndex: number, pointValue: number): Question | null;
	revealAnswer(): string | null;
	returnToMatrix(): void;
	addPlayer(player: Player): void;
	updateScore(playerId: string, delta: number): void;
	registerBuzzer(playerId: string, playerName: string, timestamp: number): BuzzerEntry;
	clearBuzzerQueue(): void;
	resetGame(): void;
}

