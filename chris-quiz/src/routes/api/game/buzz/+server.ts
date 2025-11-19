/**
 * API Route: Buzzer
 * SOLID-Prinzip: Single Responsibility - Nur Buzzer-Endpoint
 * Agent 3 Bereich (Player)
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getWebSocketServer } from '$lib/server/websocket/server';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { playerId, timestamp } = body;

		if (!playerId || typeof playerId !== 'string') {
			return error(400, { message: 'playerId ist erforderlich' });
		}

		const gameStateService = getGameStateService();
		const player = gameStateService.getPlayer(playerId);

		if (!player) {
			return error(404, { message: 'Spieler nicht gefunden' });
		}

		// Prüfe ob eine Frage aktiv ist
		const state = gameStateService.getState();
		if (state.currentView !== 'question-hidden') {
			return error(400, { message: 'Keine aktive Frage' });
		}

		// Prüfe ob bereits gebuzzt
		const alreadyBuzzed = state.buzzerQueue.some((entry) => entry.playerId === playerId);
		if (alreadyBuzzed) {
			const existingEntry = state.buzzerQueue.find((entry) => entry.playerId === playerId);
			if (existingEntry) {
				const position = state.buzzerQueue.indexOf(existingEntry) + 1;
				return json({
					success: true,
					position,
					reactionTime: existingEntry.reactionTime
				});
			}
		}

		// Registriere Buzzer
		const buzzTimestamp = timestamp || Date.now();
		const entry = gameStateService.registerBuzzer(playerId, player.name, buzzTimestamp);

		// Berechne Position (1-basiert)
		const position = state.buzzerQueue.length;

		// WebSocket Broadcast für SOFORTIGE Updates in Admin/Game View
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			// Event für sofortige Updates
			wsServer.broadcast({
				type: 'player:buzzed',
				payload: entry
			});

			// State-Sync für Konsistenz (alle Views sehen aktuellen State)
			const updatedState = gameStateService.getState();
			wsServer.broadcast({
				type: 'state:sync',
				payload: {
					...updatedState,
					players: gameStateService.getPlayers(), // Ensure players are up-to-date
					buzzerQueue: updatedState.buzzerQueue,
					questionMatrix: updatedState.questionMatrix
				}
			});
		}

		return json({
			success: true,
			position,
			reactionTime: entry.reactionTime
		});
	} catch (err) {
		console.error('[Buzzer API] Fehler:', err);
		return error(500, { message: 'Server-Fehler beim Buzzer' });
	}
};

