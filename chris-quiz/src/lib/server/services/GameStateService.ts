/**
 * Game State Service Implementation
 * SOLID-Prinzip: Single Responsibility - Verwaltet nur Game State
 * Implementiert IGameStateService Interface
 */
import type {
	IGameStateService,
	GameState,
	Question,
	Player,
	BuzzerEntry,
	MatrixCell
} from '$lib/shared';
import { getQuestionRepository } from './QuestionRepository';
import db from '../db';

// Internal state uses Map for efficient lookups
interface InternalGameState {
	currentView: 'matrix' | 'question-selected' | 'question-hidden' | 'question-reveal';
	selectedQuestion: Question | null;
	players: Map<string, Player>;
	buzzerQueue: BuzzerEntry[];
	questionMatrix: MatrixCell[][];
	categories: string[];
	gamePhase: 'idle' | 'question' | 'answering' | 'scoring';
	questionStartTime: number | null; // Persistiere die Startzeit
}

class GameStateService implements IGameStateService {
	private state: InternalGameState = {
		currentView: 'matrix',
		selectedQuestion: null,
		players: new Map<string, Player>(),
		buzzerQueue: [],
		questionMatrix: [],
		categories: [],
		gamePhase: 'idle',
		questionStartTime: null
	};

	private questions: Question[] = [];
	private questionRepo = getQuestionRepository();

	constructor() {
		this.loadQuestions();
	}

	loadQuestions(): void {
		this.questions = this.questionRepo.getAll();
		// Try to load existing state first
		if (!this.loadState()) {
			// If no state exists, initialize fresh
			if (this.questions.length > 0) {
				this.initializeMatrix();
			}
		}
	}

	private loadState(): boolean {
		try {
			const row = db.prepare('SELECT value FROM game_state WHERE key = ?').get('current_game') as { value: string } | undefined;
			if (row) {
				const savedState = JSON.parse(row.value);

				// Restore Map from array of entries if needed, or just object
				// We stored players as array in JSON, need to convert back to Map
				const playersMap = new Map<string, Player>();
				if (Array.isArray(savedState.players)) {
					savedState.players.forEach((p: Player) => playersMap.set(p.id, p));
				}

				// Validate loaded state
				if (!savedState.questionMatrix || savedState.questionMatrix.length === 0 || !savedState.categories || savedState.categories.length === 0) {
					console.warn('[GameStateService] Loaded state has invalid matrix or categories. Re-initializing.');
					return false;
				}

				this.state = {
					...savedState,
					players: playersMap
				};
				console.log('[GameStateService] State loaded from persistence');
				return true;
			}
		} catch (error) {
			console.error('[GameStateService] Failed to load state:', error);
		}
		return false;
	}

	private saveState(): void {
		try {
			const stateToSave = {
				...this.state,
				players: Array.from(this.state.players.values())
			};
			db.prepare('INSERT OR REPLACE INTO game_state (key, value) VALUES (?, ?)').run('current_game', JSON.stringify(stateToSave));
		} catch (error) {
			console.error('[GameStateService] Failed to save state:', error);
		}
	}

	getState(): GameState {
		return {
			...this.state,
			players: Array.from(this.state.players.values()), // Convert Map to Array
			buzzerQueue: [...this.state.buzzerQueue], // Clone Array
			categories: [...this.state.categories]
		};
	}

	selectQuestion(categoryIndex: number, pointValue: number): Question | null {
		// Finde Frage in Matrix
		if (
			this.state.questionMatrix.length === 0 ||
			categoryIndex >= this.state.questionMatrix[0].length ||
			pointValue === undefined
		) {
			return null;
		}

		// Durchsuche Matrix nach passender Zelle
		for (const row of this.state.questionMatrix) {
			for (const cell of row) {
				if (
					cell.categoryIndex === categoryIndex &&
					cell.pointValue === pointValue &&
					cell.question &&
					cell.state === 'available'
				) {
					// Markiere Zelle als selected
					cell.state = 'selected';

					this.state.selectedQuestion = cell.question;
					// Erst nur "selected" - Frage wird noch nicht gezeigt
					this.state.currentView = 'question-selected';
					this.state.gamePhase = 'question';
					this.state.buzzerQueue = [];
					// questionStartTime wird erst bei reveal gesetzt
					this.saveState();
					return cell.question;
				}
			}
		}

		return null;
	}

	/**
	 * Revealed die ausgewählte Frage - aktiviert Buzzer und zeigt Frage in Game-View
	 */
	revealQuestion(): boolean {
		if (!this.state.selectedQuestion || this.state.currentView !== 'question-selected') {
			return false;
		}
		
		this.state.currentView = 'question-hidden';
		this.state.questionStartTime = Date.now();
		this.saveState();
		return true;
	}


	returnToMatrix(): void {
		// Markiere aktuelle Zelle als completed
		if (this.state.selectedQuestion) {
			for (const row of this.state.questionMatrix) {
				for (const cell of row) {
					if (cell.question?.id === this.state.selectedQuestion.id) {
						cell.state = 'completed';
						break;
					}
				}
			}
		}

		this.state.currentView = 'matrix';
		this.state.selectedQuestion = null;
		this.state.buzzerQueue = [];
		this.state.gamePhase = 'idle';
		this.state.questionStartTime = null;
		this.saveState();
	}

	addPlayer(player: Player): void {
		this.state.players.set(player.id, player);
		this.saveState();
	}

	removePlayer(playerId: string): void {
		this.state.players.delete(playerId);
		// Entferne Einträge aus der Buzzer-Queue
		this.state.buzzerQueue = this.state.buzzerQueue.filter((e) => e.playerId !== playerId);
		this.saveState();
	}

	updateScore(playerId: string, delta: number): void {
		const player = this.state.players.get(playerId);
		if (player) {
			player.score = Math.max(0, player.score + delta);
			this.state.players.set(playerId, player);
			this.saveState();
		}
	}

	registerBuzzer(playerId: string, playerName: string, timestamp: number): BuzzerEntry {
		const player = this.state.players.get(playerId);
		if (!player) {
			throw new Error(`Player ${playerId} not found`);
		}

		// Prüfe ob bereits gebuzzt
		const existingEntry = this.state.buzzerQueue.find((entry) => entry.playerId === playerId);
		if (existingEntry) {
			return existingEntry;
		}

		// Berechne Reaktionszeit
		const reactionTime = this.state.questionStartTime
			? timestamp - this.state.questionStartTime
			: 0;

		const entry: BuzzerEntry = {
			playerId,
			playerName: player.name,
			timestamp,
			reactionTime
		};

		this.state.buzzerQueue.push(entry);
		this.saveState();
		return entry;
	}

	clearBuzzerQueue(): void {
		this.state.buzzerQueue = [];
		this.saveState();
	}

	resetGame(): void {
		// Reload questions from DB to ensure we have the latest
		this.loadQuestions();

		// Wenn Matrix leer ist, initialisiere sie neu
		if (this.state.questionMatrix.length === 0 && this.questions.length > 0) {
			this.initializeMatrix();
		}

		// Setze alle Matrix-Zellen wieder auf 'available' (nicht löschen!)
		for (const row of this.state.questionMatrix) {
			for (const cell of row) {
				if (cell.state === 'completed' || cell.state === 'selected') {
					cell.state = 'available';
				}
			}
		}

		// Reset Spielstand, aber behalte Matrix!
		this.state.currentView = 'matrix';
		this.state.selectedQuestion = null;
		this.state.players = new Map<string, Player>();
		this.state.buzzerQueue = [];
		this.state.gamePhase = 'idle';
		this.state.questionStartTime = null;
		this.saveState();
	}

	// Helper Methods
	setQuestions(questions: Question[]): void {
		this.questions = questions;
		this.initializeMatrix();
	}

	/**
	 * Rebuilds the matrix from the current database state.
	 * Call this after CRUD operations on questions to sync the game state.
	 */
	rebuildMatrixFromDB(): void {
		console.log('[GameStateService] Rebuilding matrix from database...');
		
		// Reload questions from database
		this.questions = this.questionRepo.getAll();
		console.log(`[GameStateService] Loaded ${this.questions.length} questions from DB`);
		
		// Preserve completed states from existing matrix
		const completedQuestionIds = new Set<string>();
		for (const row of this.state.questionMatrix) {
			for (const cell of row) {
				if (cell.state === 'completed' && cell.question) {
					completedQuestionIds.add(cell.question.id);
				}
			}
		}
		
		// Reinitialize the matrix with fresh data
		this.initializeMatrix();
		
		// Restore completed states for questions that still exist
		for (const row of this.state.questionMatrix) {
			for (const cell of row) {
				if (cell.question && completedQuestionIds.has(cell.question.id)) {
					cell.state = 'completed';
				}
			}
		}
		
		this.saveState();
		console.log('[GameStateService] Matrix rebuilt successfully');
	}

	private initializeMatrix(): void {
		// Gruppiere Fragen nach Kategorie (case-insensitive) und Punktewert
		// Normalisiere Kategorienamen für konsistente Gruppierung
		const categoryMap = new Map<string, Set<number>>();
		const categoryDisplayNames = new Map<string, string>(); // normalized -> display name
		const questionMap = new Map<string, Question>();

		for (const question of this.questions) {
			// Normalize category name for grouping (uppercase)
			const normalizedCategory = question.category.toUpperCase().trim();
			
			// Keep track of the display name (prefer uppercase version, or first seen)
			if (!categoryDisplayNames.has(normalizedCategory)) {
				// Use the uppercase version for display
				categoryDisplayNames.set(normalizedCategory, normalizedCategory);
			}
			
			const key = `${normalizedCategory}-${question.points}`;
			questionMap.set(key, question);

			if (!categoryMap.has(normalizedCategory)) {
				categoryMap.set(normalizedCategory, new Set());
			}
			categoryMap.get(normalizedCategory)!.add(question.points);
		}

		// Erstelle Matrix
		const categories = Array.from(categoryMap.keys());
		const pointValues = Array.from(
			new Set(
				Array.from(categoryMap.values())
					.flatMap((set) => Array.from(set))
					.sort((a, b) => a - b)
			)
		);

		const matrix: MatrixCell[][] = [];

		for (const pointValue of pointValues) {
			const row: MatrixCell[] = [];
			for (let i = 0; i < categories.length; i++) {
				const category = categories[i];
				const key = `${category}-${pointValue}`;
				const question = questionMap.get(key) || null;

				row.push({
					categoryIndex: i,
					pointValue,
					question,
					state: question ? 'available' : 'completed'
				});
			}
			matrix.push(row);
		}

		this.state.questionMatrix = matrix;
		// Use display names for categories
		this.state.categories = categories.map(c => categoryDisplayNames.get(c) || c);
		this.saveState();
		
		console.log(`[GameStateService] Matrix initialized with ${this.state.categories.length} categories:`, this.state.categories);
	}

	getPlayer(playerId: string): Player | undefined {
		return this.state.players.get(playerId);
	}

	getPlayers(): Player[] {
		return Array.from(this.state.players.values());
	}
}

// Singleton Instance - Verwende globalThis für HMR-Kompatibilität
// Dies verhindert, dass bei Hot Module Reloading mehrere Instanzen entstehen
declare global {
	// eslint-disable-next-line no-var
	var __gameStateServiceInstance: GameStateService | undefined;
}

export function getGameStateService(): GameStateService {
	if (!globalThis.__gameStateServiceInstance) {
		console.log('[GameStateService] Erstelle neue Singleton-Instanz');
		globalThis.__gameStateServiceInstance = new GameStateService();
	}
	return globalThis.__gameStateServiceInstance;
}

