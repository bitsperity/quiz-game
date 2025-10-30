/**
 * API Route: Select Question
 * SOLID-Prinzip: Single Responsibility - Nur Question Selection
 * Agent 2 Bereich (Admin)
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getWebSocketServer } from '$lib/server/websocket/server';

function requireAdmin(request: Request): boolean {
	const headerToken = request.headers.get('X-Admin-Token');
	const queryToken = new URL(request.url).searchParams.get('token');
	const token = headerToken || queryToken;

	// TODO: Environment Variable nutzen
	const adminToken = process.env.ADMIN_SECRET_TOKEN || 'SECRET_TOKEN';

	// Debug-Logging (nur bei Fehlern)
	if (!token || token !== adminToken) {
		console.log('[API] Admin Auth Check FAILED:', {
			headerToken: headerToken ? `${headerToken.substring(0, 5)}...` : 'null',
			queryToken: queryToken ? `${queryToken.substring(0, 5)}...` : 'null',
			token: token ? `${token.substring(0, 5)}...` : 'null',
			adminToken: adminToken ? `${adminToken.substring(0, 5)}...` : 'null',
			matches: token === adminToken
		});
	}

	return token === adminToken;
}

export const POST: RequestHandler = async ({ request }) => {
	// Admin Authentication Check
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { categoryIndex, pointValue } = await request.json();

		if (typeof categoryIndex !== 'number' || typeof pointValue !== 'number') {
			return json({ error: 'Invalid parameters' }, { status: 400 });
		}

		const gameStateService = getGameStateService();
		const question = gameStateService.selectQuestion(categoryIndex, pointValue);

		if (!question) {
			return json({ error: 'Question not found or already selected' }, { status: 404 });
		}

		// WebSocket Broadcast
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			wsServer.broadcast({
			type: 'game:question-selected',
			payload: { question }
		});
		}

		return json({
			question,
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Auswählen der Frage:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
