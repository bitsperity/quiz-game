/**
 * API Route: Update Player Score
 * SOLID-Prinzip: Single Responsibility - Nur Score Update
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

export const POST: RequestHandler = async ({ request, params }) => {
	// Admin Authentication Check
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { playerId } = params;
		const body = await request.json();
		const { delta, absoluteScore } = body;

		// Entweder delta oder absoluteScore muss vorhanden sein
		const hasDelta = typeof delta === 'number';
		const hasAbsolute = typeof absoluteScore === 'number';

		if (!playerId || (!hasDelta && !hasAbsolute)) {
			return json({ error: 'Invalid parameters - provide delta or absoluteScore' }, { status: 400 });
		}

		const gameStateService = getGameStateService();
		const player = gameStateService.getPlayer(playerId);

		if (!player) {
			return json({ error: 'Player not found' }, { status: 404 });
		}

		// absoluteScore hat Priorität, wenn beide angegeben sind
		if (hasAbsolute) {
			gameStateService.setScore(playerId, absoluteScore);
		} else {
			gameStateService.updateScore(playerId, delta);
		}
		
		const updatedPlayer = gameStateService.getPlayer(playerId);

		if (!updatedPlayer) {
			return json({ error: 'Failed to update score' }, { status: 500 });
		}

		// WebSocket Broadcast
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			wsServer.broadcast({
			type: 'player:score-updated',
			payload: {
				playerId,
				newScore: updatedPlayer.score,
				delta: hasAbsolute ? updatedPlayer.score - player.score : delta
			}
		});
		}

		return json({
			playerId,
			newScore: updatedPlayer.score,
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Aktualisieren des Scores:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

