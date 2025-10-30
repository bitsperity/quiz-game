/**
 * WebSocket Server für Quiz-App
 * SOLID-Prinzip: Single Responsibility - Verwaltet nur WebSocket-Verbindungen
 * 
 * WICHTIG: Dieser Code läuft nur im Custom Server (server.ts), nicht im SSR-Kontext!
 * Das `ws` Modul wird dynamisch importiert, um SSR-Probleme zu vermeiden.
 */
import type { IncomingMessage } from 'http';
import type { GameEvent, Player } from '$lib/shared';
import { getGameStateService } from '../services/GameStateService';
// PlayerRepository entfernt - nur GameStateService als Single Source of Truth

// Dynamischer Import für Node-only Module (verhindert SSR-Bundling)
let WebSocketServer: any;
let WebSocket: any;

async function loadWebSocketModule() {
	if (!WebSocketServer || !WebSocket) {
		const wsModule = await import('ws');
		WebSocketServer = wsModule.WebSocketServer;
		WebSocket = wsModule.WebSocket;
	}
	return { WebSocketServer, WebSocket };
}

interface ClientConnection {
	ws: any; // WebSocket (any wegen dynamischem Import)
	type: 'game' | 'admin' | 'player';
	playerId?: string;
}

class WebSocketServerManager {
	private wss: any | null = null; // WebSocketServer (any wegen dynamischem Import)
	private clients: Set<ClientConnection> = new Set();
	private gameStateService = getGameStateService();

	async initialize(server: any): Promise<void> {
		// Lade WebSocket Module dynamisch
		const { WebSocketServer: WSS, WebSocket: WS } = await loadWebSocketModule();
		WebSocketServer = WSS;
		WebSocket = WS;
		
		this.wss = new WebSocketServer({ 
			server,
			path: '/ws'
		});

		this.wss.on('connection', (ws: any, req: IncomingMessage) => {
			this.handleConnection(ws, req);
		});

		console.log('[WebSocket Server] Initialisiert auf /ws');
	}

	private handleConnection(ws: any, req: IncomingMessage): void {
		const client: ClientConnection = {
			ws,
			type: 'game' // Default, wird später aktualisiert
		};

		this.clients.add(client);
		console.log(`[WebSocket Server] Neuer Client verbunden. Gesamt Clients: ${this.clients.size}`);

		// Sende initialen State
		const state = this.gameStateService.getState();
		console.log('[WebSocket Server] Neuer Client verbunden. Aktueller State:', {
			currentView: state.currentView,
			hasQuestion: !!state.selectedQuestion,
			questionId: state.selectedQuestion?.id,
			questionCategory: state.selectedQuestion?.category,
			playersCount: state.players.size
		});
		this.sendStateSync(client);

		ws.on('message', (data: Buffer) => {
			try {
				const message = JSON.parse(data.toString()) as GameEvent;
				this.handleMessage(client, message);
			} catch (error) {
				console.error('[WebSocket Server] Fehler beim Parsen der Nachricht:', error);
			}
		});

		ws.on('close', () => {
			this.clients.delete(client);
			console.log('[WebSocket Server] Client getrennt');
		});

		ws.on('error', (error) => {
			console.error('[WebSocket Server] Fehler:', error);
			this.clients.delete(client);
		});
	}

	private handleMessage(client: ClientConnection, event: GameEvent): void {
		switch (event.type) {
			case 'admin:select-question':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { categoryIndex: number; pointValue: number };
					const question = this.gameStateService.selectQuestion(
						payload.categoryIndex,
						payload.pointValue
					);
					if (question) {
						console.log('[WebSocket Server] Frage ausgewählt, broadcast an alle Clients:', question);
						this.broadcast({
							type: 'game:question-selected',
							payload: { question }
						});
					}
				}
				break;


			case 'admin:update-score':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string; delta: number };
					this.gameStateService.updateScore(payload.playerId, payload.delta);
					const player = this.gameStateService.getPlayer(payload.playerId);
					if (player) {
						this.broadcast({
							type: 'player:score-updated',
							payload: {
								playerId: payload.playerId,
								newScore: player.score,
								delta: payload.delta
							}
						});
					}
				}
				break;

			case 'admin:return-to-matrix':
				this.gameStateService.returnToMatrix();
				this.broadcast({
					type: 'game:return-to-matrix'
				});
				break;

			case 'admin:delete-player':
				if ('payload' in event && event.payload) {
					const payload = event.payload as { playerId: string };
					// SINGLE SOURCE OF TRUTH: Nur GameStateService verwenden
					const player = this.gameStateService.getPlayer(payload.playerId);
					
					if (player) {
						// Entferne aus GameState (Single Source of Truth)
						this.gameStateService.removePlayer(payload.playerId);
						
						// Broadcast
						this.broadcast({
							type: 'player:removed',
							payload: { playerId: payload.playerId }
						});
						
						// State-Sync an alle Clients senden
						this.broadcast({
							type: 'state:sync',
							payload: {
								currentView: this.gameStateService.getState().currentView,
								selectedQuestion: this.gameStateService.getState().selectedQuestion,
								players: this.gameStateService.getPlayers(),
								buzzerQueue: this.gameStateService.getState().buzzerQueue,
								matrix: this.gameStateService.getState().questionMatrix
							}
						});
					}
				}
				break;

			case 'player:buzz':
				if (client.playerId && 'payload' in event && event.payload) {
					const payload = event.payload as { timestamp: number };
					try {
						const player = this.gameStateService.getPlayer(client.playerId);
						if (player) {
							const entry = this.gameStateService.registerBuzzer(
								client.playerId,
								player.name,
								payload.timestamp
							);
							this.broadcast({
								type: 'player:buzzed',
								payload: entry
							});
						}
					} catch (error) {
						console.error('[WebSocket Server] Fehler beim Buzzer:', error);
					}
				}
				break;

			case 'player:registered':
				if ('payload' in event && event.payload && 'player' in event.payload) {
					const player = (event.payload as { player: Player }).player;
					client.playerId = player.id;
					client.type = 'player';
					
					// SINGLE SOURCE OF TRUTH: Nur GameStateService verwenden
					const existingInGameState = this.gameStateService.getPlayer(player.id);
					const existingPlayers = this.gameStateService.getPlayers();
					const existingByName = existingPlayers.find(p => p.name.toLowerCase() === player.name.toLowerCase());
					
					if (existingInGameState) {
						// Player existiert bereits im GameState - verwende existierenden Player (behält Score)
						console.log(`[WebSocket] Player ${player.id} (${existingInGameState.name}) bereits im GameState, verwende existierenden Player`);
						
						// Sende State Sync damit Client aktuellen Score sieht
						this.sendStateSync(client);
					} else if (existingByName && existingByName.id !== player.id) {
						// Name existiert bereits mit anderer ID - verwende existierenden Player
						console.log(`[WebSocket] Name "${player.name}" existiert bereits mit ID ${existingByName.id}, verwende existierenden Player`);
						client.playerId = existingByName.id; // Update client ID to match existing player
						this.sendStateSync(client);
					} else {
						// Player existiert NICHT im GameState - das bedeutet er wurde ausgeloggt!
						// Re-Registrierung mit alter ID wird IGNORIERT - Client muss sich neu registrieren über /api/players/register
						console.log(`[WebSocket] ⚠️ Re-Registrierung für nicht-existierenden Player ${player.id} (${player.name}) wird ignoriert - Spieler wurde ausgeloggt`);
						console.log(`[WebSocket] Aktuelle Spieler im GameState:`, existingPlayers.map(p => `${p.name} (${p.id})`));
						
						// Sende State Sync damit Client sieht dass er nicht mehr existiert
						this.sendStateSync(client);
					}
				}
				break;
		}
	}

	private sendStateSync(client: ClientConnection): void {
		const state = this.gameStateService.getState();
		const playersArray = Array.from(state.players.values());

		const message: GameEvent = {
			type: 'state:sync',
			payload: {
				currentView: state.currentView,
				selectedQuestion: state.selectedQuestion,
				players: playersArray,
				buzzerQueue: state.buzzerQueue,
				matrix: state.questionMatrix
			}
		};

		const WS_OPEN = 1; // WebSocket.OPEN
		if (client.ws.readyState === WS_OPEN) {
			console.log('[WebSocket Server] Sende state:sync an Client:', {
				currentView: state.currentView,
				hasQuestion: !!state.selectedQuestion,
				questionId: state.selectedQuestion?.id,
				playersCount: playersArray.length,
				players: playersArray.map(p => `${p.name} (${p.id})`)
			});
			client.ws.send(JSON.stringify(message));
		} else {
			console.warn('[WebSocket Server] Client WebSocket nicht offen, kann state:sync nicht senden. ReadyState:', client.ws.readyState);
		}
	}

	broadcast(event: GameEvent): void {
		const message = JSON.stringify(event);
		const WS_OPEN = 1; // WebSocket.OPEN
		let sentCount = 0;
		let closedCount = 0;
		console.log(`[WebSocket Server] Broadcast "${event.type}" an ${this.clients.size} Clients...`);
		this.clients.forEach((client) => {
			if (client.ws.readyState === WS_OPEN) {
				try {
					client.ws.send(message);
					sentCount++;
				} catch (error) {
					console.error('[WebSocket Server] Fehler beim Senden:', error);
				}
			} else {
				closedCount++;
				console.warn(`[WebSocket Server] Client hat readyState ${client.ws.readyState} (nicht OPEN)`);
			}
		});
		console.log(`[WebSocket Server] Event "${event.type}" an ${sentCount} von ${this.clients.size} Clients gesendet (${closedCount} geschlossen)`);
	}

	close(): void {
		const WS_OPEN = 1; // WebSocket.OPEN
		this.clients.forEach((client) => {
			if (client.ws.readyState === WS_OPEN) {
				client.ws.close();
			}
		});
		this.clients.clear();

		if (this.wss) {
			this.wss.close();
			this.wss = null;
		}
	}
}

// Singleton Instance
let wsServerInstance: WebSocketServerManager | null = null;

export function getWebSocketServer(): WebSocketServerManager {
	if (!wsServerInstance) {
		wsServerInstance = new WebSocketServerManager();
	}
	return wsServerInstance;
}

