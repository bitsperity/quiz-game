/**
 * API Route: Player Registration
 * SOLID-Prinzip: Single Responsibility - Nur Player Registration
 * Agent 3 Bereich
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Player } from '$lib/shared';
import { MIN_PLAYER_NAME_LENGTH, MAX_PLAYER_NAME_LENGTH } from '$lib/shared';
import { getGameStateService } from '$lib/server/services/GameStateService';
import { getWebSocketServer } from '$lib/server/websocket/server';


export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name } = body;

		// Validierung
		if (!name || typeof name !== 'string') {
			return error(400, {
				message: 'Name ist erforderlich'
			});
		}

		const trimmedName = name.trim();

		if (trimmedName.length < MIN_PLAYER_NAME_LENGTH) {
			return error(400, {
				message: `Name muss mindestens ${MIN_PLAYER_NAME_LENGTH} Zeichen lang sein`
			});
		}

		if (trimmedName.length > MAX_PLAYER_NAME_LENGTH) {
			return error(400, {
				message: `Name darf maximal ${MAX_PLAYER_NAME_LENGTH} Zeichen lang sein`
			});
		}

		const gameStateService = getGameStateService();
		
		// Duplikat-Check: Prüfe ob Name bereits existiert (case-insensitive)
		// SINGLE SOURCE OF TRUTH: Nur GameStateService verwenden
		const existingPlayers = gameStateService.getPlayers();
		const nameLower = trimmedName.toLowerCase();
		if (existingPlayers.some(p => p.name.toLowerCase() === nameLower)) {
			return error(409, {
				message: `Ein Spieler mit dem Namen "${trimmedName}" existiert bereits`
			});
		}

		// Player erstellen - nur GameStateService verwenden
		const id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const player: Player = {
			id,
			name: trimmedName,
			score: 0,
			registeredAt: Date.now()
		};

		// SINGLE SOURCE OF TRUTH: Nur GameStateService
		gameStateService.addPlayer(player);
		console.log('[Player Registration] Spieler hinzugefügt:', player.name, 'ID:', player.id);
		
		// Prüfe dass Spieler wirklich hinzugefügt wurde
		const afterAdd = gameStateService.getPlayer(player.id);
		const allPlayers = gameStateService.getPlayers();
		console.log('[Player Registration] Nach Hinzufügung - Spieler vorhanden:', !!afterAdd, 'Alle Spieler:', allPlayers.map(p => `${p.name} (${p.id})`));

		// WebSocket Broadcast (konsistent mit anderen Endpoints)
		const wsServer = getWebSocketServer();
		if (wsServer && typeof wsServer.broadcast === 'function') {
			const playersForSync = gameStateService.getPlayers();
			console.log('[Player Registration] Sende Events mit', playersForSync.length, 'Spielern:', playersForSync.map(p => `${p.name} (${p.id})`));
			
			// Sende player:registered Event
			wsServer.broadcast({
			type: 'player:registered',
			payload: { player }
		});
		
			// State-Sync an alle Clients senden (Single Source of Truth)
			const state = gameStateService.getState();
			wsServer.broadcast({
			type: 'state:sync',
			payload: {
					currentView: state.currentView,
					selectedQuestion: state.selectedQuestion,
					players: playersForSync,
					buzzerQueue: state.buzzerQueue,
					matrix: state.questionMatrix
				}
			});
			console.log('[Player Registration] ✅ Events gesendet');
		} else {
			console.log('[Player Registration] ⚠️ WebSocket Server nicht verfügbar');
		}

		return json({
			player,
			success: true
		});
	} catch (err) {
		console.error('[Player Registration] Fehler:', err);
		return error(500, {
			message: 'Server-Fehler bei der Registrierung'
		});
	}
};

