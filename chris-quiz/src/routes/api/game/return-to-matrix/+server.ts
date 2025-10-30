/**
 * API Route: Return to Matrix
 * SOLID-Prinzip: Single Responsibility - Nur Return to Matrix
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
		gameStateService.returnToMatrix();

		// WebSocket Broadcast
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			wsServer.broadcast({
			type: 'game:return-to-matrix'
		});
		}

		return json({
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Zurückkehren zur Matrix:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

