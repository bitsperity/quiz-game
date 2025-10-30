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

class GameStateService implements IGameStateService {
	private state: GameState = {
		currentView: 'matrix',
		selectedQuestion: null,
		players: new Map<string, Player>(),
		buzzerQueue: [],
		questionMatrix: [],
		gamePhase: 'idle'
	};

	private questions: Question[] = [];
	private questionStartTime: number | null = null;

	getState(): GameState {
		return {
			...this.state,
			players: new Map(this.state.players), // Clone Map
			buzzerQueue: [...this.state.buzzerQueue] // Clone Array
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
					// Entferne Antwort aus Frage-Objekt bevor es gespeichert wird
					const questionWithoutAnswer = {
						id: cell.question.id,
						category: cell.question.category,
						points: cell.question.points,
						question: cell.question.question
					};
					this.state.selectedQuestion = questionWithoutAnswer;
					this.state.currentView = 'question-hidden';
					this.state.gamePhase = 'question';
					this.state.buzzerQueue = [];
					this.questionStartTime = Date.now();
					return questionWithoutAnswer;
				}
			}
		}

		return null;
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
		this.questionStartTime = null;
	}

	addPlayer(player: Player): void {
		this.state.players.set(player.id, player);
	}

	removePlayer(playerId: string): void {
		this.state.players.delete(playerId);
		// Entferne Einträge aus der Buzzer-Queue
		this.state.buzzerQueue = this.state.buzzerQueue.filter((e) => e.playerId !== playerId);
	}

	updateScore(playerId: string, delta: number): void {
		const player = this.state.players.get(playerId);
		if (player) {
			player.score = Math.max(0, player.score + delta);
			this.state.players.set(playerId, player);
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
		const reactionTime = this.questionStartTime
			? timestamp - this.questionStartTime
			: 0;

		const entry: BuzzerEntry = {
			playerId,
			playerName: player.name,
			timestamp,
			reactionTime
		};

		this.state.buzzerQueue.push(entry);
		return entry;
	}

	clearBuzzerQueue(): void {
		this.state.buzzerQueue = [];
	}

	resetGame(): void {
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
		this.questionStartTime = null;
	}

	// Helper Methods
	setQuestions(questions: Question[]): void {
		this.questions = questions;
		this.initializeMatrix();
	}

	private initializeMatrix(): void {
		// Gruppiere Fragen nach Kategorie und Punktewert
		const categoryMap = new Map<string, Set<number>>();
		const questionMap = new Map<string, Question>();

		for (const question of this.questions) {
			const key = `${question.category}-${question.points}`;
			questionMap.set(key, question);

			if (!categoryMap.has(question.category)) {
				categoryMap.set(question.category, new Set());
			}
			categoryMap.get(question.category)!.add(question.points);
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
	}

	getPlayer(playerId: string): Player | undefined {
		return this.state.players.get(playerId);
	}

	getPlayers(): Player[] {
		return Array.from(this.state.players.values());
	}
}

// Singleton Instance
let gameStateServiceInstance: GameStateService | null = null;

export function getGameStateService(): GameStateService {
	if (!gameStateServiceInstance) {
		gameStateServiceInstance = new GameStateService();
	}
	return gameStateServiceInstance;
}

