/**
 * API Route: Reset Questions
 * SOLID-Prinzip: Single Responsibility - Nur Reset
 * Admin Bereich
 * 
 * WICHTIG: Diese Route löscht alle Questions aus der Datenbank
 * und synchronisiert den GameState.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getQuestionRepository } from '$lib/server/services/QuestionRepository';

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
		// Lösche alle Questions aus der DB (Single Source of Truth)
		const questionRepo = getQuestionRepository();
		questionRepo.deleteAll();

		// Synchronisiere GameState mit leerer DB
		const gameStateService = getGameStateService();
		gameStateService.rebuildMatrixFromDB();

		return json({
			success: true,
			message: 'Alle Fragen wurden zurückgesetzt'
		});
	} catch (error) {
		console.error('[API] Fehler beim Zurücksetzen:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

