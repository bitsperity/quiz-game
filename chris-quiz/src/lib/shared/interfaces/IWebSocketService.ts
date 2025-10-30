/**
 * Interface für WebSocket Service
 * SOLID-Prinzip: Interface Segregation
 */
import type { GameEvent } from '../types';

export interface IWebSocketService {
	connect(): void;
	disconnect(): void;
	send(event: GameEvent): void;
	onMessage(handler: (event: GameEvent) => void): void;
	onError(handler: (error: Error) => void): void;
	isConnected(): boolean;
}

