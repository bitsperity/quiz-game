/**
 * Game View WebSocket Service
 * SOLID-Prinzip: Single Responsibility - Nur WebSocket Kommunikation für Game View
 * Agent 1 Bereich
 */
import type { GameEvent, WebSocketMessage, Question, BuzzerEntry, Player, MatrixCell } from '$lib/shared';
import { WS_PATH } from '$lib/shared';
import { get, writable } from 'svelte/store';
import { gameViewState } from '../stores/gameViewState';

class GameViewWebSocketService {
	private ws: WebSocket | null = null;
	private messageHandlers: Array<(event: GameEvent) => void> = [];
	private errorHandlers: Array<(error: Error) => void> = [];
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;

	public connectionStatus = writable<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

	connect(): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.connectionStatus.set('connected');
			return;
		}

		this.connectionStatus.set('connecting');
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}${WS_PATH}`;

		try {
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				console.log('[Game View WS] Verbunden');
				this.connectionStatus.set('connected');
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
				this.connectionStatus.set('error');
				this.errorHandlers.forEach((handler) => handler(new Error('WebSocket Fehler')));
			};

			this.ws.onclose = () => {
				console.log('[Game View WS] Verbindung geschlossen');
				this.connectionStatus.set('disconnected');
				this.attemptReconnect();
			};
		} catch (error) {
			console.error('[Game View WS] Verbindungsfehler:', error);
			this.connectionStatus.set('error');
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
				// Frage ist ausgewählt aber noch nicht revealed - Matrix mit Highlight zeigen
				if ('payload' in event && event.payload) {
					const payload = event.payload as { question: Question };
					console.log('[Game View WS] 🎯 Frage selected (noch nicht revealed):', payload.question.category);
					gameViewState.update((state) => ({
						...state,
						currentView: 'matrix', // Bleibt auf Matrix!
						serverView: 'question-selected',
						selectedQuestion: payload.question,
						buzzerQueue: [],
						lastWebSocketUpdate: Date.now()
					}));
				}
				break;

			case 'game:question-revealed':
				// Frage wurde revealed - jetzt Frage anzeigen
				if ('payload' in event && event.payload) {
					const payload = event.payload as { question: Question };
					console.log('[Game View WS] ✅ Frage REVEALED:', payload.question.category);
					gameViewState.update((state) => ({
						...state,
						currentView: 'question',
						serverView: 'question-hidden',
						selectedQuestion: payload.question,
						lastWebSocketUpdate: Date.now()
					}));
				}
				break;

			case 'game:return-to-matrix':
				console.log('[Game View WS] ⬅️ Return to Matrix');
				gameViewState.update((state) => ({
					...state,
					currentView: 'matrix',
					serverView: 'matrix',
					selectedQuestion: null,
					selectedAnswer: null,
					buzzerQueue: [],
					lastWebSocketUpdate: Date.now()
				}));
				break;

			case 'game:reset':
				console.log('[Game View WS] 🔄 Game Reset');
				gameViewState.update((state) => ({
					currentView: 'matrix',
					serverView: 'matrix',
					selectedQuestion: null,
					selectedAnswer: null,
					buzzerQueue: [],
					players: [],
					matrix: state.matrix.map(row =>
						row.map(cell => ({
							...cell,
							state: cell.state === 'completed' || cell.state === 'selected' ? 'available' : cell.state
						}))
					), // Matrix behalten, aber Zellen auf 'available' zurücksetzen
					categories: [],
					gamePhase: 'idle',
					lastWebSocketUpdate: Date.now()
				}));
				break;

			case 'player:buzzed':
				if ('payload' in event && event.payload) {
					const buzzerEntry = event.payload as BuzzerEntry;
					gameViewState.update((state) => ({
						...state,
						buzzerQueue: [...state.buzzerQueue, buzzerEntry],
						lastWebSocketUpdate: Date.now()
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
						),
						lastWebSocketUpdate: Date.now()
					}));
				}
				break;

			case 'player:removed':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string };
					console.log('[Game View WS] player:removed Event empfangen für:', payload.playerId);
					const currentState = get(gameViewState);
					console.log('[Game View WS] Aktuelle Spieler:', currentState.players.map(p => p.id));
					gameViewState.update((state) => {
						const newPlayers = state.players.filter((p) => p.id !== payload.playerId);
						console.log('[Game View WS] Neue Spieler-Liste:', newPlayers.map(p => p.id));
						return {
							...state,
							players: newPlayers,
							buzzerQueue: state.buzzerQueue.filter((entry) => entry.playerId !== payload.playerId),
							lastWebSocketUpdate: Date.now()
						};
					});
				}
				break;

			case 'state:sync':
				if ('payload' in event && event.payload) {
					const payload = event.payload as {
						currentView: 'matrix' | 'question-selected' | 'question-hidden' | 'question-reveal';
						selectedQuestion: Question | null;
						players: Player[];
						buzzerQueue: BuzzerEntry[];
						questionMatrix: MatrixCell[][];
						categories: string[];
						gamePhase: 'idle' | 'question' | 'answering' | 'scoring';
					};
					// Map shared GameState view to local GameViewState view
					// question-selected = Matrix mit Highlight (Frage noch nicht sichtbar)
					// question-hidden = Frage sichtbar, Buzzer aktiv
					let localView: 'matrix' | 'question' | 'answer' = 'matrix';
					if (payload.currentView === 'question-hidden') {
						localView = 'question';
					} else if (payload.currentView === 'question-reveal') {
						localView = 'answer';
					}
					// question-selected bleibt 'matrix' (mit Highlight)

					gameViewState.set({
						currentView: localView,
						selectedQuestion: payload.selectedQuestion,
						selectedAnswer: null,
						players: Array.isArray(payload.players) ? payload.players : [],
						buzzerQueue: payload.buzzerQueue,
						matrix: payload.questionMatrix,
						categories: payload.categories || [],
						gamePhase: payload.gamePhase,
						serverView: payload.currentView,
						lastWebSocketUpdate: Date.now()
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

