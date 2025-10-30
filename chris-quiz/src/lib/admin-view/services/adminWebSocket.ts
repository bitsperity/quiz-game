/**
 * Admin WebSocket Service
 * SOLID-Prinzip: Single Responsibility - Nur WebSocket Kommunikation für Admin
 * Agent 2 Bereich
 */
import type { GameEvent, WebSocketMessage } from '$lib/shared';
import { WS_PATH } from '$lib/shared';

class AdminWebSocketService {
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
				console.log('[Admin WS] Verbunden');
				this.reconnectAttempts = 0;
			};

			this.ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					this.handleMessage(message);
				} catch (error) {
					console.error('[Admin WS] Fehler beim Parsen der Nachricht:', error);
				}
			};

			this.ws.onerror = (error) => {
				console.error('[Admin WS] Fehler:', error);
				this.errorHandlers.forEach((handler) => handler(new Error('WebSocket Fehler')));
			};

			this.ws.onclose = () => {
				console.log('[Admin WS] Verbindung geschlossen');
				this.attemptReconnect();
			};
		} catch (error) {
			console.error('[Admin WS] Verbindungsfehler:', error);
			this.errorHandlers.forEach((handler) => handler(error as Error));
		}
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			setTimeout(() => {
				console.log(`[Admin WS] Reconnect Versuch ${this.reconnectAttempts}...`);
				this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		}
	}

	private handleMessage(message: WebSocketMessage): void {
		// WebSocket Events für Admin View
		const event = message as GameEvent;

		this.messageHandlers.forEach((handler) => {
			try {
				handler(event);
			} catch (error) {
				console.error('[Admin WS] Fehler im Message Handler:', error);
			}
		});
	}

	send(event: GameEvent): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(event));
		} else {
			console.warn('[Admin WS] WebSocket nicht verbunden, Event nicht gesendet:', event);
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

export const adminWebSocket = new AdminWebSocketService();

