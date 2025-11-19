/**
 * API Route: Question Management
 * SOLID-Prinzip: Single Responsibility - Nur Question Management
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

// GET: Alle Fragen abrufen
export const GET: RequestHandler = async ({ request }) => {
	if (!requireAdmin(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const gameStateService = getGameStateService();
		const state = gameStateService.getState();

		// Sammle alle Fragen aus der Matrix (ohne Antworten)
		const questions: Question[] = [];
		for (const row of state.questionMatrix) {
			for (const cell of row) {
				if (cell.question) {
					// Entferne Antwort aus Frage-Objekt bevor es gespeichert wird
					const questionWithoutAnswer: Omit<Question, 'answer'> = {
						id: cell.question.id,
						category: cell.question.category,
						points: cell.question.points,
						question: cell.question.question
					};
					questions.push(questionWithoutAnswer as Question); // Cast back to Question for the array type
				}
			}
		}

		return json({
			questions,
			count: questions.length
		});
	} catch (error) {
		console.error('[API] Fehler beim Abrufen der Fragen:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// POST: Einzelne Frage erstellen
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

		// Erstelle neue Frage (ohne Antwort im System zu speichern)
		const newQuestion: Omit<Question, 'answer'> = {
			id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			category,
			points,
			question
		};

		// Für die Matrix brauchen wir die vollständige Frage mit Antwort (interne Verwendung)
		const questionWithAnswer = {
			...newQuestion,
			answer: answer.trim(),
			category: category.trim(),
			question: question.trim()
		};

		// Füge neue Frage hinzu und initialisiere Matrix neu
		existingQuestions.push(questionWithAnswer as any);
		gameStateService.setQuestions(existingQuestions as any);

		return json({
			question: newQuestion, // Antwort nicht zurückgeben
			success: true
		});
	} catch (error) {
		console.error('[API] Fehler beim Erstellen der Frage:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

