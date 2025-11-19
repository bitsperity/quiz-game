/**
 * API Route: Reset Game
 * SOLID-Prinzip: Single Responsibility - Nur Game Reset
 * Agent 2 Bereich (Admin)
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getWebSocketServer } from '$lib/server/websocket/server';

function requireAdmin(request: Request): boolean {
	const token =
		request.headers.get('X-Admin-Token') ||
		new URL(request.url).searchParams.get('token');

	const adminToken = process.env.ADMIN_SECRET_TOKEN || 'SECRET_TOKEN';

	return token === adminToken;
}

export const POST: RequestHandler = async ({ request }) => {
	// Admin Authentication Check
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const gameStateService = getGameStateService();

		// SINGLE SOURCE OF TRUTH: Hole alle Spieler BEVOR sie gelöscht werden (für Debug-Log)
		const allPlayers = gameStateService.getPlayers();
		console.log('[Game Reset] Resette GameState. Aktuelle Spieler:', allPlayers.map(p => `${p.name} (${p.id})`));

		// Reset Game State (löscht auch Player aus GameState - Single Source of Truth)
		gameStateService.resetGame();

		const remainingPlayers = gameStateService.getPlayers();
		console.log('[Game Reset] Nach Reset - Verbleibende Spieler:', remainingPlayers.map(p => `${p.name} (${p.id})`));

		// State-Sync an alle Clients senden (Single Source of Truth - EINZIGES Event)
		// Das reicht aus - Clients sehen dass alle Spieler weg sind und alles zurückgesetzt wurde
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			const state = gameStateService.getState();
			const playersForSync = gameStateService.getPlayers();
			console.log('[Game Reset] Sende state:sync mit', playersForSync.length, 'Spielern');

			// Sende game:reset Event für Clients die darauf reagieren wollen
			wsServer.broadcast({
				type: 'game:reset'
			});

			// State-Sync mit leerem State
			wsServer.broadcast({
				type: 'state:sync',
				payload: {
					...state,
					players: playersForSync, // Use playersForSync as it reflects the post-reset state
					buzzerQueue: state.buzzerQueue,
					questionMatrix: state.questionMatrix,
					gamePhase: state.gamePhase
				}
			});
			console.log('[Game Reset] ✅ Reset-Events gesendet');
		} else {
			console.log('[Game Reset] ⚠️ WebSocket Server nicht verfügbar - Reset wurde durchgeführt, aber keine Clients informiert');
		}

		return json({
			success: true,
			message: 'Spielstand wurde zurückgesetzt (Spieler, Punkte und Spielphase)'
		});
	} catch (error) {
		console.error('[API] Fehler beim Zurücksetzen des Spiels:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

