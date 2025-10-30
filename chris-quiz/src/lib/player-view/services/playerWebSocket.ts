/**
 * Player View WebSocket Service
 * SOLID-Prinzip: Single Responsibility - Nur WebSocket Kommunikation für Player View
 * Agent 3 Bereich
 */
import type { GameEvent, WebSocketMessage, Player, BuzzerEntry, Question } from '$lib/shared';
import { WS_PATH } from '$lib/shared';
import { get } from 'svelte/store';
import {
	playerState,
	setBuzzerEnabled,
	setBuzzed,
	updatePlayers,
	updatePlayerScore,
	logout,
	setCurrentQuestion,
	setPlayer
} from '../stores/playerState';

class PlayerWebSocketService {
	private ws: WebSocket | null = null;
	private messageHandlers: Array<(event: GameEvent) => void> = [];
	private errorHandlers: Array<(error: Error) => void> = [];
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private playerId: string | null = null;
	private isRegistering = false; // Flag um zu verhindern, dass state:sync während Registrierung ausloggt
	private registrationTimeout: ReturnType<typeof setTimeout> | null = null;
	private missingFromListCount = 0; // Zähler wie oft Spieler nicht in Liste war
	private triedAutoRegister = false; // Schutz, Auto-Registrierung nur einmal versuchen

	private async autoRegisterFromLocalName(name: string): Promise<void> {
		try {
			console.log('[Player View WS] Auto-Registrierung gestartet für:', name);
			this.isRegistering = true;
			this.missingFromListCount = 0;
			this.registrationTimeout && clearTimeout(this.registrationTimeout);
			this.registrationTimeout = setTimeout(() => {
				console.log('[Player View WS] Auto-Registrierung Timeout');
				this.isRegistering = false;
				this.registrationTimeout = null;
			}, 5000);

			const res = await fetch('/api/players/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || 'Auto-Registrierung fehlgeschlagen');
			}
			const data = await res.json();
			const player = data.player as Player;
			setPlayer(player);
			this.playerId = player.id;
			console.log('[Player View WS] Auto-Registrierung erfolgreich, neue ID:', player.id);
			// Kein syncFromServer() hier - Polling in +page.svelte sorgt für Konsistenz
		} catch (e) {
			console.error('[Player View WS] Auto-Registrierung Fehler:', e);
			logout();
		} finally {
			if (this.registrationTimeout) {
				clearTimeout(this.registrationTimeout);
				this.registrationTimeout = null;
			}
			this.isRegistering = false;
		}
	}

	private async syncFromServer(): Promise<void> {
		try {
			const res = await fetch('/api/game/state');
			if (!res.ok) return;
			const data = await res.json();
			const players: Player[] = Array.isArray(data.players) ? data.players : [];
			updatePlayers(players);
			setCurrentQuestion(data.selectedQuestion || null);
			setBuzzerEnabled(data.currentView === 'question-hidden');
			const s = get(playerState);
			if (s.playerId && Array.isArray(data.buzzerQueue)) {
				const idx = data.buzzerQueue.findIndex((e: BuzzerEntry) => e.playerId === s.playerId);
				setBuzzed(idx >= 0 ? idx + 1 : null);
			}
			console.log('[Player View WS] syncFromServer() -> Spieler:', players.map(p => `${p.name} (${p.id})`));
		} catch (e) {
			console.warn('[Player View WS] syncFromServer() fehlgeschlagen:', e);
		}
	}

	connect(playerId?: string): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		if (playerId) {
			this.playerId = playerId;
			this.isRegistering = true; // Setze Flag wenn playerId übergeben wird (neue Registrierung)
			this.missingFromListCount = 0; // Reset Counter

			// Clear existing timeout
			if (this.registrationTimeout) {
				clearTimeout(this.registrationTimeout);
			}

			// Setze Timeout für Registrierung
			this.registrationTimeout = setTimeout(() => {
				console.log('[Player View WS] Registrierung-Timeout - setze isRegistering auf false');
				this.isRegistering = false;
				this.registrationTimeout = null;
			}, 5000);
		} else {
			// Versuche PlayerId aus State zu holen
			const state = get(playerState);
			if (state.playerId) {
				this.playerId = state.playerId;
			}
		}

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}${WS_PATH}`;

		try {
			console.log('[Player View WS] Versuche Verbindung zu:', wsUrl);
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				console.log('[Player View WS] ✅ Verbunden zu', wsUrl);
				this.reconnectAttempts = 0;
				
				// Sende vollständigen Player falls vorhanden (für Re-Registrierung nach F5)
				if (this.playerId) {
					const state = get(playerState);
					if (state.playerId && state.playerName) {
						console.log('[Player View WS] Sende Re-Registrierung für Player:', state.playerId, state.playerName);
						this.isRegistering = true; // Setze Flag während Registrierung
						this.missingFromListCount = 0; // Reset Counter
						
						// Clear existing timeout
						if (this.registrationTimeout) {
							clearTimeout(this.registrationTimeout);
						}
						
						// Sende vollständigen Player mit Name für Re-Registrierung
						this.send({
							type: 'player:registered',
							payload: { 
								player: { 
									id: state.playerId,
									name: state.playerName,
									score: 0,
									registeredAt: Date.now()
								} as Player
							}
						});
						
						// Reset Flag nach kurzer Zeit (falls kein player:registered Event kommt)
						this.registrationTimeout = setTimeout(() => {
							console.log('[Player View WS] Registrierung-Timeout - setze isRegistering auf false');
							this.isRegistering = false;
							this.registrationTimeout = null;
						}, 5000);
					}
				} else {
					console.log('[Player View WS] Keine PlayerId vorhanden, warte auf Registrierung');
				}
				
				void this.syncFromServer();
			};

			this.ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					this.handleMessage(message);
				} catch (error) {
					console.error('[Player View WS] Fehler beim Parsen der Nachricht:', error);
				}
			};

			this.ws.onerror = (error) => {
				console.error('[Player View WS] ❌ WebSocket Fehler:', error);
				console.error('[Player View WS] WebSocket Error Event:', error);
				this.errorHandlers.forEach((handler) => handler(new Error('WebSocket Fehler')));
			};

			this.ws.onclose = (event) => {
				console.log('[Player View WS] ⚠️ Verbindung geschlossen. Code:', event.code, 'Reason:', event.reason);
				this.attemptReconnect();
			};
		} catch (error) {
			console.error('[Player View WS] Verbindungsfehler:', error);
			this.errorHandlers.forEach((handler) => handler(error as Error));
		}
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			setTimeout(() => {
				console.log(`[Player View WS] Reconnect Versuch ${this.reconnectAttempts}...`);
				this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		}
	}

	private handleMessage(message: WebSocketMessage): void {
		const event = message as GameEvent;
		
		// Nur wichtige Events loggen, nicht jedes
		if (event.type === 'game:question-selected' || event.type === 'state:sync') {
			console.log('[Player View WS] Event empfangen:', event.type);
		}

		// Automatisches State-Update für Player View Events
		switch (event.type) {
			case 'game:question-selected':
				// Buzzer aktivieren wenn Frage ausgewählt wurde
				if ('payload' in event && event.payload) {
					const payload = event.payload as { question: Question };
					console.log('[Player View WS] ✅ Frage ausgewählt:', payload.question.id);
					setCurrentQuestion(payload.question);
					setBuzzerEnabled(true);
					setBuzzed(null); // Reset buzzed state (null = nicht gebuzzt)
				} else {
					console.warn('[Player View WS] ⚠️ game:question-selected ohne Payload!');
				}
				break;

			case 'game:return-to-matrix':
				// Zurück zur Matrix - Buzzer zurücksetzen
				setBuzzerEnabled(false);
				setBuzzed(null);
				setCurrentQuestion(null);
				break;

			case 'game:reset':
				// Spiel wurde zurückgesetzt - alles zurücksetzen
				setBuzzerEnabled(false);
				setBuzzed(null);
				setCurrentQuestion(null);
				// WICHTIG: Spieler-Liste wird von Polling aktualisiert (Single Source of Truth)
				// WebSocket Events sind nur Benachrichtigungen
				console.log('[Player View WS] game:reset Event - Spieler-Liste wird von Polling aktualisiert');
				break;

			case 'player:buzzed':
				// Ignoriere dieses Event - die Position wird aus der Buzzer-Queue im state:sync berechnet
				// Wenn dieser Spieler gebuzzt hat, wird das im state:sync Event korrekt gesetzt
				break;

			case 'player:score-updated':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string; newScore: number; delta: number };
					updatePlayerScore(payload.playerId, payload.newScore);
				}
				break;

			case 'player:registered':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { player: Player };
					console.log('[Player View WS] Spieler registriert:', payload.player);
					this.isRegistering = false; // Registrierung abgeschlossen
					this.missingFromListCount = 0; // Reset Counter

					// Clear registration timeout
					if (this.registrationTimeout) {
						clearTimeout(this.registrationTimeout);
						this.registrationTimeout = null;
					}

					const state = get(playerState);
					
					// Stelle sicher, dass der View auf 'game' ist wenn der Spieler eingeloggt ist
					if (state.playerId === payload.player.id && state.currentView === 'login') {
						playerState.update(s => ({ ...s, currentView: 'game' }));
					}
					
					// WICHTIG: Spieler-Liste wird von Polling aktualisiert (Single Source of Truth)
					// WebSocket Events sind nur Benachrichtigungen
					console.log('[Player View WS] player:registered Event - Spieler-Liste wird von Polling aktualisiert');
				}
				break;

			case 'player:removed':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string };
					const state = get(playerState);
					
					// Falls der gelöschte Spieler der aktuelle Spieler ist, logge ihn aus
					if (state.playerId === payload.playerId) {
						logout();
					}
					
					// WICHTIG: Spieler-Liste wird von Polling aktualisiert (Single Source of Truth)
					// WebSocket Events sind nur Benachrichtigungen
					console.log('[Player View WS] player:removed Event - Spieler-Liste wird von Polling aktualisiert');
				}
				break;

			case 'state:sync':
				if ('payload' in event && event.payload) {
					const payload = event.payload as {
						currentView: 'matrix' | 'question-hidden' | 'question-reveal';
						selectedQuestion: Question | null;
						players: Player[] | Map<string, Player>;
						buzzerQueue: BuzzerEntry[];
					};
					
					console.log('[Player View WS] State Sync empfangen:', {
						playersCount: payload.players instanceof Map ? payload.players.size : payload.players?.length,
						hasQuestion: !!payload.selectedQuestion,
						currentView: payload.currentView
					});
					
					// Konvertiere Map zu Array falls nötig
					const playersArray = payload.players instanceof Map 
						? Array.from(payload.players.values())
						: Array.isArray(payload.players)
						? payload.players
						: [];
					
					console.log('[Player View WS] Spieler-Array:', playersArray.map(p => `${p.name} (${p.id})`));
					
					// WICHTIG: Prüfe ob der aktuelle Spieler noch in der Liste ist
					const state = get(playerState);
					console.log('[Player View WS] Aktueller Spieler-ID:', state.playerId, 'Ist in Liste:', !!playersArray.find(p => p.id === state.playerId));

					if (state.playerId && !playersArray.find(p => p.id === state.playerId)) {
						// Spieler existiert nicht mehr
						if (this.isRegistering) {
							// Registrierung läuft noch - erhöhe Counter
							this.missingFromListCount++;
							console.log('[Player View WS] Spieler noch nicht in Liste, aber Registrierung läuft... (Count:', this.missingFromListCount, ')');

							// Wenn Spieler nach mehreren Syncs immer noch nicht da ist, ausloggen
							if (this.missingFromListCount >= 3) {
								console.log('[Player View WS] Spieler nach', this.missingFromListCount, 'Syncs immer noch nicht in Liste - Registrierung fehlgeschlagen, logge aus');
								this.isRegistering = false;
								if (this.registrationTimeout) {
									clearTimeout(this.registrationTimeout);
									this.registrationTimeout = null;
								}
								logout();
								return;
							}
							// Weiter mit Update, Registrierung wird das beheben
						} else {
							// Nicht während Registrierung - versuche Auto-Registrierung mit lokalem Namen (einmalig)
							if (!this.triedAutoRegister && state.playerName) {
								this.triedAutoRegister = true;
								void this.autoRegisterFromLocalName(state.playerName);
								// Kein return: wir lassen das Update weiterlaufen; nach erfolgreicher Auto-Registrierung kommt ein neuer state:sync
							} else {
								console.log('[Player View WS] Spieler existiert nicht mehr und keine Auto-Registrierung möglich, logge aus:', state.playerId);
						logout();
						return; // Frühzeitig beenden, keine weiteren Updates
							}
						}
					} else {
						// Spieler ist in der Liste - Reset Counter
						this.missingFromListCount = 0;
					}
					
					// WICHTIG: Nicht mehr updatePlayers() hier aufrufen!
					// Polling in +page.svelte holt den korrekten State von REST API (Single Source of Truth)
					// WebSocket Events sind nur Benachrichtigungen für Frage/Buzzer-Status
					console.log('[Player View WS] State Sync empfangen - Spieler-Liste wird von Polling aktualisiert (nicht hier)');
					
					// Setze aktuelle Frage
					// WICHTIG: Setze Frage auch wenn currentView nicht question-hidden ist
					// Die Frage sollte angezeigt werden solange sie gesetzt ist
					setCurrentQuestion(payload.selectedQuestion || null);
					
					// Setze Buzzer-Status basierend auf currentView
					// Buzzer ist nur aktiv wenn question-hidden (nicht bei question-reveal oder matrix)
					const buzzerEnabled = payload.currentView === 'question-hidden';
					setBuzzerEnabled(buzzerEnabled);
					
					// Prüfe ob dieser Spieler bereits gebuzzt hat
					if (this.playerId && payload.buzzerQueue) {
						const buzzerIndex = payload.buzzerQueue.findIndex(
							(entry) => entry.playerId === this.playerId
						);
						if (buzzerIndex !== -1) {
							setBuzzed(buzzerIndex + 1); // Position ist 1-basiert
						} else {
							setBuzzed(null); // Nicht gebuzzt
						}
					} else {
						setBuzzed(null); // Nicht gebuzzt
					}
					// Kein syncFromServer() hier - WebSocket Event ist Single Source of Truth
					// Polling in +page.svelte sorgt für Konsistenz mit REST API
				}
				break;
		}

		// Zusätzliche Handler aufrufen
		this.messageHandlers.forEach((handler) => {
			try {
				handler(event);
			} catch (error) {
				console.error('[Player View WS] Fehler im Message Handler:', error);
			}
		});
	}

	send(event: GameEvent): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(event));
		} else {
			console.warn('[Player View WS] WebSocket nicht verbunden, Event nicht gesendet:', event);
		}
	}

	async buzz(timestamp: number = Date.now()): Promise<void> {
		const state = get(playerState);
		if (!state.playerId) {
			console.warn('[Player View WS] Kann nicht buzzen - keine playerId');
			return;
		}

		// WICHTIG: Buzzer nutzt REST API, nicht WebSocket Event!
		// WebSocket Events sind nur für Benachrichtigungen, REST API ist Single Source of Truth
		try {
			const response = await fetch('/api/game/buzz', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					playerId: state.playerId,
					timestamp
				})
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({}));
				console.error('[Player View WS] Buzzer-Request fehlgeschlagen:', error.message || 'Unknown error');
				return;
			}

			const data = await response.json();
			console.log('[Player View WS] ✅ Buzzer erfolgreich:', data);
		} catch (error) {
			console.error('[Player View WS] Fehler beim Buzzer-Request:', error);
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
		this.playerId = null; // WICHTIG: Zurücksetzen damit keine Re-Registrierung für ausgeloggten Spieler gesendet wird
		this.isRegistering = false;
		this.missingFromListCount = 0;
		if (this.registrationTimeout) {
			clearTimeout(this.registrationTimeout);
			this.registrationTimeout = null;
		}
		this.messageHandlers = [];
		this.errorHandlers = [];
		this.reconnectAttempts = 0;
	}

	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}

export const playerWebSocket = new PlayerWebSocketService();

