/**
 * API Route: Player Logout
 * SOLID-Prinzip: Single Responsibility - Nur Player Logout
 * Agent 3 Bereich
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getWebSocketServer } from '$lib/server/websocket/server';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { playerId } = body;

		if (!playerId || typeof playerId !== 'string') {
			return json({ error: 'playerId ist erforderlich' }, { status: 400 });
		}

		const gameStateService = getGameStateService();

		// SINGLE SOURCE OF TRUTH: Nur GameStateService verwenden
		const existing = gameStateService.getPlayer(playerId);
		console.log('[Player Logout] Logout für PlayerId:', playerId, 'Player gefunden:', !!existing);

		if (existing) {
			// Entferne aus GameState (Single Source of Truth)
			gameStateService.removePlayer(playerId);
			console.log('[Player Logout] Player entfernt aus GameState:', playerId, 'Name:', existing.name);

			// Prüfe dass Spieler wirklich entfernt wurde
			const afterRemoval = gameStateService.getPlayer(playerId);
			const remainingPlayers = gameStateService.getPlayers();
			console.log('[Player Logout] Nach Entfernung - Spieler noch vorhanden:', !!afterRemoval, 'Verbleibende Spieler:', remainingPlayers.map(p => `${p.name} (${p.id})`));

			// State-Sync an alle Clients senden (Single Source of Truth - EINZIGES Event)
			// Das reicht aus, Clients sehen dass Spieler weg ist
			const wsServer = getWebSocketServer();
			try {
				if (wsServer && typeof wsServer.broadcast === 'function') {
					const state = gameStateService.getState();
					const playersForSync = gameStateService.getPlayers();
					console.log('[Player Logout] Sende state:sync mit', playersForSync.length, 'Spielern:', playersForSync.map(p => `${p.name} (${p.id})`));

					wsServer.broadcast({
						type: 'state:sync',
						payload: {
							...state,
							players: playersForSync, // Use playersForSync as it's explicitly fetched after removal
							buzzerQueue: state.buzzerQueue,
							questionMatrix: state.questionMatrix,
							gamePhase: state.gamePhase
						}
					});
					console.log('[Player Logout] ✅ state:sync Event gesendet (Spieler entfernt)');
				} else {
					console.log('[Player Logout] ⚠️ WebSocket Server nicht verfügbar - Spieler wurde entfernt, aber keine Clients informiert');
				}
			} catch (error) {
				console.error('[Player Logout] ❌ Fehler beim Broadcast:', error);
			}
		} else {
			console.log('[Player Logout] ⚠️ Spieler nicht gefunden in GameState:', playerId);
		}

		return json({ success: true });
	} catch (err) {
		console.error('[Player Logout] Fehler:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

