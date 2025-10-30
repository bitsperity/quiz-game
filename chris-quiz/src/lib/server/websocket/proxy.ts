/**
 * WebSocket Server Proxy
 * 
 * Diese Datei stellt eine Proxy-Funktion bereit, die nur im Custom Server verfügbar ist.
 * API Routes können diese verwenden, ohne den ws-Code direkt zu importieren.
 * 
 * WICHTIG: Diese Datei enthält KEINE ws-Imports, um SSR-Probleme zu vermeiden!
 */

import type { GameEvent } from '$lib/shared';

// Globaler WebSocket Server Instance (wird vom Custom Server gesetzt)
let wsServerInstance: {
	broadcast: (event: GameEvent) => void;
} | null = null;

/**
 * Setzt die WebSocket Server Instance (nur vom Custom Server aufgerufen)
 */
export function setWebSocketServer(instance: { broadcast: (event: GameEvent) => void }): void {
	wsServerInstance = instance;
}

/**
 * Gibt die WebSocket Server Instance zurück (null wenn nicht initialisiert)
 */
export function getWebSocketServerProxy(): { broadcast: (event: GameEvent) => void } | null {
	return wsServerInstance;
}

/**
 * Broadcastet ein Event an alle Clients (null-safe)
 */
export function broadcastEvent(event: GameEvent): void {
	if (wsServerInstance) {
		wsServerInstance.broadcast(event);
	} else {
		console.warn('[WebSocket Proxy] WebSocket Server nicht initialisiert, Event nicht gesendet:', event.type);
	}
}

