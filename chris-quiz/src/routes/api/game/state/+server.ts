/**
 * API Route: Game State
 * SOLID-Prinzip: Single Responsibility - Nur State-Endpoint
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';

export const GET: RequestHandler = async () => {
	const gameStateService = getGameStateService();
	const state = gameStateService.getState();

	return json({
		currentView: state.currentView,
		selectedQuestion: state.selectedQuestion,
		players: Array.from(state.players.values()),
		buzzerQueue: state.buzzerQueue,
		questionMatrix: state.questionMatrix,
		gamePhase: state.gamePhase
	});
};

