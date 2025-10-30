/**
 * API Route: Bulk Question Import
 * SOLID-Prinzip: Single Responsibility - Nur Bulk Import
 * Admin Bereich
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Question } from '$lib/shared';
import { getGameStateService } from '$lib/server/services/GameStateService';

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

		const gameStateService = getGameStateService();
		const state = gameStateService.getState();
		
		// Sammle alle vorhandenen Fragen
		const existingQuestions: Question[] = [];
		for (const row of state.questionMatrix) {
			for (const cell of row) {
				if (cell.question) {
					existingQuestions.push(cell.question);
				}
			}
		}

		// Validiere und füge neue Fragen hinzu
		const newQuestions: Question[] = [];
		const errors: string[] = [];

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

			// Erstelle Frage mit Antwort für interne Speicherung
			const questionWithAnswer = {
				id: q.id || `q_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
				category: q.category.trim(),
				points: q.points,
				question: q.question.trim(),
				answer: q.answer.trim()
			};

			newQuestions.push(questionWithAnswer as any);
		}

		// Füge alle neuen Fragen hinzu
		const allQuestions = [...existingQuestions, ...newQuestions];
		gameStateService.setQuestions(allQuestions);

		return json({
			imported: newQuestions.length,
			errors: errors.length > 0 ? errors : undefined,
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Bulk-Import:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

