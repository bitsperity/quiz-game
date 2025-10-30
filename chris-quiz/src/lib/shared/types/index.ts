/**
 * Shared Types für alle Agent-Bereiche
 * SOLID-Prinzip: Interface Segregation - Kleine, spezifische Interfaces
 */

export interface Player {
	id: string;
	name: string;
	score: number;
	registeredAt: number;
}

export interface Question {
	id: string;
	category: string;
	points: number;
	question: string;
	answer: string;
}

export interface Category {
	id: string;
	name: string;
}

export interface MatrixCell {
	categoryIndex: number;
	pointValue: number;
	question: Question | null;
	state: 'available' | 'selected' | 'completed';
}

export interface BuzzerEntry {
	playerId: string;
	playerName: string;
	timestamp: number;
	reactionTime: number;
}

export interface GameState {
	currentView: 'matrix' | 'question-hidden' | 'question-reveal';
	selectedQuestion: Question | null;
	players: Map<string, Player>;
	buzzerQueue: BuzzerEntry[];
	questionMatrix: MatrixCell[][];
	gamePhase: 'idle' | 'question' | 'answering' | 'scoring';
}

export interface WebSocketMessage {
	type: string;
	payload?: unknown;
}

// Event Types für WebSocket-Kommunikation
export type GameEvent =
	| { type: 'game:question-selected'; payload: { question: Question } }
	| { type: 'game:return-to-matrix' }
	| { type: 'game:reset' }
	| { type: 'player:registered'; payload: { player: Player } }
	| { type: 'player:buzzed'; payload: BuzzerEntry }
	| { type: 'player:score-updated'; payload: { playerId: string; newScore: number; delta: number } }
	| { type: 'state:sync'; payload: GameState }
	| { type: 'admin:select-question'; payload: { categoryIndex: number; pointValue: number } }
	| { type: 'admin:update-score'; payload: { playerId: string; delta: number } }
	| { type: 'admin:return-to-matrix' }
	| { type: 'admin:reset-game' }
	| { type: 'player:buzz'; payload: { timestamp: number } };

