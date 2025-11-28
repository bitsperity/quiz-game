/**
 * API Route: Question Management
 * SOLID-Prinzip: Single Responsibility - Nur Question Management
 * Admin Bereich
 * 
 * WICHTIG: Diese Route verwendet jetzt die Datenbank als Single Source of Truth
 * und synchronisiert den GameState nach Änderungen.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Question } from '$lib/shared';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getQuestionRepository } from '$lib/server/services/QuestionRepository';

function requireAdmin(request: Request): boolean {
	const token =
		request.headers.get('X-Admin-Token') ||
		new URL(request.url).searchParams.get('token');

	const adminToken = process.env.ADMIN_SECRET_TOKEN || 'SECRET_TOKEN';

	return token === adminToken;
}

// GET: Alle Fragen abrufen (aus DB - Single Source of Truth)
export const GET: RequestHandler = async ({ request }) => {
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const questionRepo = getQuestionRepository();
		const allQuestions = questionRepo.getAll();

		// Entferne Antworten für die API-Response
		const questions = allQuestions.map(q => ({
			id: q.id,
			category: q.category,
			points: q.points,
			question: q.question
		}));

		return json({
			questions,
			count: questions.length
		});
	} catch (error) {
		console.error('[API] Fehler beim Abrufen der Fragen:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// POST: Einzelne Frage erstellen (in DB + GameState sync)
export const POST: RequestHandler = async ({ request }) => {
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { category, points, question, answer } = body;

		// Validierung
		if (!category || typeof category !== 'string') {
			return json({ error: 'category ist erforderlich' }, { status: 400 });
		}
		if (typeof points !== 'number' || points <= 0) {
			return json({ error: 'points muss eine positive Zahl sein' }, { status: 400 });
		}
		if (!question || typeof question !== 'string') {
			return json({ error: 'question ist erforderlich' }, { status: 400 });
		}
		if (!answer || typeof answer !== 'string') {
			return json({ error: 'answer ist erforderlich' }, { status: 400 });
		}

		// Speichere in DB (Single Source of Truth)
		const questionRepo = getQuestionRepository();
		const newQuestion = questionRepo.create({
			category: category.trim(),
			points,
			question: question.trim(),
			answer: answer.trim()
		});

		// Synchronisiere GameState mit DB
		const gameStateService = getGameStateService();
		gameStateService.rebuildMatrixFromDB();

		return json({
			question: {
				id: newQuestion.id,
				category: newQuestion.category,
				points: newQuestion.points,
				question: newQuestion.question
				// Antwort nicht zurückgeben
			},
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Erstellen der Frage:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

