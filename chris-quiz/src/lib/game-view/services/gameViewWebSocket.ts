/**
 * Game View WebSocket Service
 * SOLID-Prinzip: Single Responsibility - Nur WebSocket Kommunikation für Game View
 * Agent 1 Bereich
 */
import type { GameEvent, WebSocketMessage, Question, BuzzerEntry, Player, MatrixCell } from '$lib/shared';
import { WS_PATH } from '$lib/shared';
import { gameViewState } from '../stores/gameViewState';

class GameViewWebSocketService {
	private ws: WebSocket | null = null;
	private messageHandlers: Array<(event: GameEvent) => void> = [];
	private errorHandlers: Array<(error: Error) => void> = [];
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;

	connect(): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}${WS_PATH}`;

		try {
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				console.log('[Game View WS] Verbunden');
				this.reconnectAttempts = 0;
			};

			this.ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					this.handleMessage(message);
				} catch (error) {
					console.error('[Game View WS] Fehler beim Parsen der Nachricht:', error);
				}
			};

			this.ws.onerror = (error) => {
				console.error('[Game View WS] Fehler:', error);
				this.errorHandlers.forEach((handler) => handler(new Error('WebSocket Fehler')));
			};

			this.ws.onclose = () => {
				console.log('[Game View WS] Verbindung geschlossen');
				this.attemptReconnect();
			};
		} catch (error) {
			console.error('[Game View WS] Verbindungsfehler:', error);
			this.errorHandlers.forEach((handler) => handler(error as Error));
		}
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			setTimeout(() => {
				console.log(`[Game View WS] Reconnect Versuch ${this.reconnectAttempts}...`);
				this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		}
	}

	private handleMessage(message: WebSocketMessage): void {
		const event = message as GameEvent;

		// Automatisches State-Update für Game View Events
		switch (event.type) {
			case 'game:question-selected':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { question: Question };
					gameViewState.update((state) => ({
						...state,
						currentView: 'question',
						selectedQuestion: payload.question,
						buzzerQueue: []
					}));
				}
				break;

			case 'game:answer-revealed':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { answer: string };
					gameViewState.update((state) => ({
						...state,
						currentView: 'answer',
						selectedAnswer: payload.answer
					}));
				}
				break;

			case 'game:return-to-matrix':
				gameViewState.update((state) => ({
					...state,
					currentView: 'matrix',
					selectedQuestion: null,
					selectedAnswer: null,
					buzzerQueue: []
				}));
				break;

			case 'game:reset':
				gameViewState.update((state) => ({
					currentView: 'matrix',
					selectedQuestion: null,
					selectedAnswer: null,
					buzzerQueue: [],
					players: [],
					matrix: state.matrix.map(row => 
						row.map(cell => ({
							...cell,
							state: cell.state === 'completed' || cell.state === 'selected' ? 'available' : cell.state
						}))
					) // Matrix behalten, aber Zellen auf 'available' zurücksetzen
				}));
				break;

			case 'player:buzzed':
				if ('payload' in event && event.payload) {
					const buzzerEntry = event.payload as BuzzerEntry;
					gameViewState.update((state) => ({
						...state,
						buzzerQueue: [...state.buzzerQueue, buzzerEntry]
					}));
				}
				break;

			case 'player:score-updated':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string; newScore: number; delta: number };
					gameViewState.update((state) => ({
						...state,
						players: state.players.map((p) =>
							p.id === payload.playerId ? { ...p, score: payload.newScore } : p
						)
					}));
				}
				break;

			case 'player:removed':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string };
					console.log('[Game View WS] player:removed Event empfangen für:', payload.playerId);
					const currentState = gameViewState.get();
					console.log('[Game View WS] Aktuelle Spieler:', currentState.players.map(p => p.id));
					gameViewState.update((state) => {
						const newPlayers = state.players.filter((p) => p.id !== payload.playerId);
						console.log('[Game View WS] Neue Spieler-Liste:', newPlayers.map(p => p.id));
						return {
						...state,
							players: newPlayers,
						buzzerQueue: state.buzzerQueue.filter((entry) => entry.playerId !== payload.playerId)
						};
					});
				}
				break;

			case 'state:sync':
				if ('payload' in event && event.payload) {
					const payload = event.payload as {
						currentView: 'matrix' | 'question-hidden' | 'question-reveal';
						selectedQuestion: Question | null;
						players: Player[];
						buzzerQueue: BuzzerEntry[];
						matrix: MatrixCell[][];
					};
					// Finde die Antwort in der Matrix wenn question-reveal
					let answer: string | null = null;
					if (payload.currentView === 'question-reveal' && payload.selectedQuestion) {
						for (const row of payload.matrix) {
							for (const cell of row) {
								if (cell?.question?.id === payload.selectedQuestion?.id) {
									answer = cell.question.answer || null;
									break;
								}
							}
						}
					}
					gameViewState.set({
						currentView:
							payload.currentView === 'question-hidden'
								? 'question'
								: payload.currentView === 'question-reveal'
									? 'answer'
								: 'matrix',
						selectedQuestion: payload.selectedQuestion,
						selectedAnswer: answer,
						buzzerQueue: payload.buzzerQueue,
						players: Array.isArray(payload.players) ? payload.players : [],
						matrix: payload.matrix
					});
				}
				break;
		}

		// Zusätzliche Handler aufrufen
		this.messageHandlers.forEach((handler) => {
			try {
				handler(event);
			} catch (error) {
				console.error('[Game View WS] Fehler im Message Handler:', error);
			}
		});
	}

	send(event: GameEvent): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(event));
		} else {
			console.warn('[Game View WS] WebSocket nicht verbunden, Event nicht gesendet:', event);
		}
	}

	onMessage(handler: (event: GameEvent) => void): void {
		this.messageHandlers.push(handler);
	}

	onError(handler: (error: Error) => void): void {
		this.errorHandlers.push(handler);
	}

	disconnect(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.messageHandlers = [];
		this.errorHandlers = [];
	}

	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}

export const gameViewWebSocket = new GameViewWebSocketService();

