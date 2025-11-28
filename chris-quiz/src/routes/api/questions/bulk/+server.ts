/**
 * API Route: Bulk Question Import
 * SOLID-Prinzip: Single Responsibility - Nur Bulk Import
 * Admin Bereich
 * 
 * WICHTIG: Diese Route verwendet jetzt die Datenbank als Single Source of Truth
 * und synchronisiert den GameState nach Änderungen.
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
		const body = await request.json();
		const { questions } = body;

		if (!Array.isArray(questions)) {
			return json({ error: 'questions muss ein Array sein' }, { status: 400 });
		}

		const questionRepo = getQuestionRepository();
		const errors: string[] = [];
		let importedCount = 0;

		// Validiere und speichere in DB
		for (let i = 0; i < questions.length; i++) {
			const q = questions[i];
			
			if (!q.category || typeof q.category !== 'string') {
				errors.push(`Frage ${i + 1}: category fehlt oder ist ungültig`);
				continue;
			}
			if (typeof q.points !== 'number' || q.points <= 0) {
				errors.push(`Frage ${i + 1}: points muss eine positive Zahl sein`);
				continue;
			}
			if (!q.question || typeof q.question !== 'string') {
				errors.push(`Frage ${i + 1}: question fehlt oder ist ungültig`);
				continue;
			}
			if (!q.answer || typeof q.answer !== 'string') {
				errors.push(`Frage ${i + 1}: answer fehlt oder ist ungültig`);
				continue;
			}

			// Speichere in DB (Single Source of Truth)
			questionRepo.create({
				category: q.category.trim(),
				points: q.points,
				question: q.question.trim(),
				answer: q.answer.trim()
			});
			importedCount++;
		}

		// Synchronisiere GameState mit DB
		const gameStateService = getGameStateService();
		gameStateService.rebuildMatrixFromDB();

		return json({
			imported: importedCount,
			errors: errors.length > 0 ? errors : undefined,
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Bulk-Import:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

