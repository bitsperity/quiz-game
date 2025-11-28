/**
 * API Route: Sync Matrix from Database
 * Rebuilds the game matrix from the current database questions.
 * Use this after adding/editing questions in the admin panel.
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
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const gameStateService = getGameStateService();
		
		// Rebuild matrix from database
		gameStateService.rebuildMatrixFromDB();
		
		// Get updated state
		const state = gameStateService.getState();
		
		// Broadcast new state to all clients
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			wsServer.broadcast({
				type: 'state:sync',
				payload: state
			});
			console.log('[Sync Matrix] State broadcasted to all clients');
		}

		return json({
			success: true,
			message: 'Matrix wurde aus der Datenbank neu aufgebaut',
			categories: state.categories,
			questionsCount: state.questionMatrix.flat().filter(cell => cell.question).length
		});
	} catch (error) {
		console.error('[API] Fehler beim Synchronisieren der Matrix:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

