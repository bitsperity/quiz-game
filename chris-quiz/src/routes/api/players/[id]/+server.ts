/**
 * API Route: Player Management (Delete)
 * SOLID-Prinzip: Single Responsibility - Nur Player Deletion
 * Agent 2 Bereich (Admin)
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getWebSocketServer } from '$lib/server/websocket/server';

function requireAdmin(request: Request): boolean {
	const adminToken = process.env.ADMIN_TOKEN || 'SECRET_TOKEN';
	const token = request.headers.get('X-Admin-Token');
	return token === adminToken;
}

export const DELETE: RequestHandler = async ({ request, params }) => {
	// Admin Authentication Check
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { id } = params;

		if (!id || typeof id !== 'string') {
			return json({ error: 'playerId ist erforderlich' }, { status: 400 });
		}

		const gameStateService = getGameStateService();

		// SINGLE SOURCE OF TRUTH: Nur GameStateService verwenden
		const player = gameStateService.getPlayer(id);

		if (!player) {
			return json({ error: 'Spieler nicht gefunden' }, { status: 404 });
		}

		// Entferne Player aus GameState (Single Source of Truth)
		gameStateService.removePlayer(id);

		// State-Sync an alle Clients senden (Single Source of Truth - EINZIGES Event)
		const wsServer = getWebSocketServer();
		if (wsServer) {
			const state = gameStateService.getState();
			wsServer.broadcast({
				type: 'state:sync',
				payload: {
					currentView: state.currentView,
					selectedQuestion: state.selectedQuestion,
					players: state.players,
					buzzerQueue: state.buzzerQueue,
					questionMatrix: state.questionMatrix,
					categories: state.categories,
					gamePhase: state.gamePhase
				}
			});
		}

		console.log(`[API] Spieler "${player.name}" (${id}) wurde gelöscht`);

		return json({ success: true, message: `Spieler "${player.name}" wurde gelöscht` });
	} catch (err) {
		console.error('[Player Delete] Fehler:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

