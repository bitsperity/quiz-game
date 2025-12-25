<script lang="ts">
	/**
	 * AGENT 2 BEREICH: Admin View
	 * SOLID-Prinzip: Single Responsibility - Nur Admin Control Logik
	 * Unabhängig von Game und Player View
	 */
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import MiniMatrix from '$lib/admin-view/components/MiniMatrix.svelte';
	import PlayerDashboard from '$lib/admin-view/components/PlayerDashboard.svelte';
	import BuzzerQueue from '$lib/admin-view/components/BuzzerQueue.svelte';
	import QuestionControl from '$lib/admin-view/components/QuestionControl.svelte';
	import {
		gameState,
		selectedCell,
		activePlayerId
	} from '$lib/admin-view/stores/adminState';
	import { adminWebSocket } from '$lib/admin-view/services/adminWebSocket';
	import type { GameEvent } from '$lib/shared';

	$: token = $page.url.searchParams.get('token');

	// Admin Authentication Check
	onMount(() => {
		const checkAuth = async () => {
			if (!token) {
			alert('Admin-Zugriff erfordert Token. Beispiel: /admin?token=SECRET_TOKEN');
			goto('/');
			return;
		}

		// WebSocket verbinden
		adminWebSocket.connect();

		// WebSocket Event Handlers
		adminWebSocket.onMessage((event: GameEvent) => {
			handleWebSocketEvent(event);
		});

		adminWebSocket.onError((error) => {
			console.error('[Admin] WebSocket Fehler:', error);
		});

			// Load initial state
			await loadGameState();
		};
		checkAuth();

		// Polling: Aktualisiere State alle 2 Sekunden (Fallback wenn WebSocket nicht funktioniert)
		// UND nach jedem Logout um sicherzustellen, dass der State aktuell ist
		const pollingInterval = setInterval(() => {
			loadGameState(); // Immer laden, nicht nur wenn WebSocket nicht verbunden
		}, 2000);

		// Cleanup
		return () => {
			clearInterval(pollingInterval);
		};
	});

	onDestroy(() => {
		adminWebSocket.disconnect();
	});

	async function loadGameState() {
		try {
			const response = await fetch('/api/game/state');
			if (response.ok) {
				const data = await response.json();
				gameState.set({
					currentView: data.currentView || 'matrix',
					selectedQuestion: data.selectedQuestion || null,
					players: Array.isArray(data.players) ? data.players : [],
					buzzerQueue: Array.isArray(data.buzzerQueue) ? data.buzzerQueue : [],
					questionMatrix: Array.isArray(data.questionMatrix) ? data.questionMatrix : [],
					gamePhase: data.gamePhase || 'idle'
				});

				// Update selectedCell wenn Frage ausgewählt
				if (data.selectedQuestion) {
					// Finde die Zelle in der Matrix
					const matrix = data.questionMatrix || [];
					for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
						const row = matrix[rowIndex];
						for (let colIndex = 0; colIndex < row.length; colIndex++) {
							const cell = row[colIndex];
							if (
								cell?.question?.id === data.selectedQuestion.id ||
								(cell?.question?.category === data.selectedQuestion.category &&
									cell?.question?.points === data.selectedQuestion.points)
							) {
								selectedCell.set({
									category: colIndex,
									points: cell.pointValue
								});
								break;
							}
						}
					}
				}

			}
		} catch (error) {
			console.error('[Admin] Fehler beim Laden des Game States:', error);
		}
	}

	function handleWebSocketEvent(event: GameEvent) {
		switch (event.type) {
			case 'state:sync':
				if (event.payload) {
					const state = event.payload as typeof $gameState;
					gameState.set({
						currentView: state.currentView || 'matrix',
						selectedQuestion: state.selectedQuestion || null,
						players: Array.isArray(state.players)
							? state.players
							: state.players || [],
						buzzerQueue: Array.isArray(state.buzzerQueue) ? state.buzzerQueue : [],
						questionMatrix: Array.isArray(state.questionMatrix) ? state.questionMatrix : [],
						gamePhase: state.gamePhase || 'idle'
					});
				}
				break;

			case 'player:removed':
				if (event.payload && 'playerId' in event.payload) {
					const payload = event.payload as { playerId: string };
					console.log('[Admin] player:removed Event empfangen für:', payload.playerId);
					const currentPlayers = [...$gameState.players];
					const filteredPlayers = currentPlayers.filter((p) => p.id !== payload.playerId);
					console.log('[Admin] Entferne Spieler, neue Liste:', filteredPlayers.map(p => p.id));
					gameState.update((state) => ({
						...state,
						players: filteredPlayers
					}));
				}
				break;

			case 'player:registered':
				if (event.payload && 'player' in event.payload) {
					const currentPlayers = [...$gameState.players];
					const newPlayer = (event.payload as { player: typeof currentPlayers[0] }).player;
					if (!currentPlayers.find((p) => p.id === newPlayer.id)) {
						currentPlayers.push(newPlayer);
						gameState.update((state) => ({
							...state,
							players: currentPlayers
						}));
					}
				}
				break;

			case 'player:buzzed':
				if (event.payload) {
					const entry = event.payload as typeof $gameState.buzzerQueue[0];
					gameState.update((state) => ({
						...state,
						buzzerQueue: [...state.buzzerQueue, entry]
					}));
				}
				break;

			case 'player:score-updated':
				if (event.payload && 'playerId' in event.payload) {
					const { playerId, newScore } = event.payload as {
						playerId: string;
						newScore: number;
					};
					gameState.update((state) => ({
						...state,
						players: state.players.map((p) =>
							p.id === playerId ? { ...p, score: newScore } : p
						)
					}));
				}
				break;

			case 'player:removed':
				if (event.payload && 'playerId' in event.payload) {
					const { playerId } = event.payload as { playerId: string };
					gameState.update((state) => ({
						...state,
						players: state.players.filter((p) => p.id !== playerId)
					}));
					// Reset activePlayerId falls gelöschter Player aktiv war
					if ($activePlayerId === playerId) {
						activePlayerId.set(null);
					}
				}
				break;

			case 'game:return-to-matrix':
				selectedCell.set(null);
				activePlayerId.set(null);
				gameState.update((state) => ({
					...state,
					currentView: 'matrix',
					selectedQuestion: null,
					buzzerQueue: [],
					gamePhase: 'idle'
				}));
				break;

			case 'game:reset':
				selectedCell.set(null);
				activePlayerId.set(null);
				gameState.update((state) => ({
					currentView: 'matrix',
					selectedQuestion: null,
					players: [],
					buzzerQueue: [],
					questionMatrix: state.questionMatrix.map(row => 
						row.map(cell => ({
							...cell,
							state: cell.state === 'completed' || cell.state === 'selected' ? 'available' : cell.state
						}))
					), // Matrix behalten, aber Zellen auf 'available' zurücksetzen
					gamePhase: 'idle'
				}));
				break;
		}
	}

	async function handleCellClick(category: number, points: number) {
		// Hole Token direkt aus URL falls nicht im State
		const currentToken = token || $page.url.searchParams.get('token');
		
		if (!currentToken) {
			console.error('[Admin] Kein Token verfügbar für select-question');
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}
		
		try {
			console.log('[Admin] Wähle Frage aus:', { category, points, token: currentToken });
			
			const response = await fetch('/api/game/select-question', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Admin-Token': currentToken
				},
				body: JSON.stringify({ categoryIndex: category, pointValue: points })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				console.error('[Admin] Fehler beim Auswählen der Frage:', response.status, errorData);
				alert(`Fehler beim Auswählen der Frage: ${errorData.error || 'Unbekannter Fehler'}`);
				return;
			}

			const data = await response.json();
			if (data.success && data.question) {
				selectedCell.set({ category, points });
				gameState.update((state) => ({
					...state,
					selectedQuestion: data.question,
					currentView: 'question-selected', // Erst "selected", nicht "hidden"!
					gamePhase: 'question'
				}));

				// WebSocket Event senden
				adminWebSocket.send({
					type: 'admin:select-question',
					payload: { categoryIndex: category, pointValue: points }
				});
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Auswählen der Frage:', error);
			alert(`Fehler beim Auswählen der Frage: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
		}
	}


	async function handleReturnToMatrix() {
		const currentToken = token || $page.url.searchParams.get('token');
		if (!currentToken) {
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}
		
		try {
			const response = await fetch('/api/game/return-to-matrix', {
				method: 'POST',
				headers: {
					'X-Admin-Token': currentToken
				}
			});

			if (response.ok) {
				selectedCell.set(null);
				activePlayerId.set(null);
				gameState.update((state) => ({
					...state,
					currentView: 'matrix',
					selectedQuestion: null,
					buzzerQueue: [],
					gamePhase: 'idle'
				}));

				// WebSocket Event senden
				adminWebSocket.send({
					type: 'admin:return-to-matrix'
				});
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Zurückkehren zur Matrix:', error);
		}
	}

	function handleRevealQuestion() {
		// WebSocket Event senden um Frage aufzudecken
		adminWebSocket.send({
			type: 'admin:reveal-question'
		});
		
		// Lokalen State aktualisieren
		gameState.update((state) => ({
			...state,
			currentView: 'question-hidden'
		}));
	}

	async function handleScoreUpdate(playerId: string, delta: number) {
		const currentToken = token || $page.url.searchParams.get('token');
		if (!currentToken) {
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}
		
		try {
			const response = await fetch(`/api/players/${playerId}/score`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Admin-Token': currentToken
				},
				body: JSON.stringify({ delta })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					// Update local state - der Broadcast wird bereits von der API-Route gemacht
					gameState.update((state) => ({
						...state,
						players: state.players.map((p) =>
							p.id === playerId ? { ...p, score: data.newScore } : p
						)
					}));
					// KEIN zusätzliches WebSocket-Event senden - die API-Route macht bereits den Broadcast!
				}
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Aktualisieren des Scores:', error);
		}
	}

	async function handleScoreSet(playerId: string, absoluteScore: number) {
		const currentToken = token || $page.url.searchParams.get('token');
		if (!currentToken) {
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}
		
		try {
			const response = await fetch(`/api/players/${playerId}/score`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Admin-Token': currentToken
				},
				body: JSON.stringify({ absoluteScore })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					// Update local state - der Broadcast wird bereits von der API-Route gemacht
					gameState.update((state) => ({
						...state,
						players: state.players.map((p) =>
							p.id === playerId ? { ...p, score: data.newScore } : p
						)
					}));
				}
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Setzen des Scores:', error);
		}
	}

	function handleSelectPlayer(playerId: string) {
		activePlayerId.set(playerId);
	}

	async function handleDeletePlayer(playerId: string) {
		const currentToken = token || $page.url.searchParams.get('token');
		if (!currentToken) {
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}
		
		try {
			const response = await fetch(`/api/players/${playerId}`, {
				method: 'DELETE',
				headers: {
					'X-Admin-Token': currentToken
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					// Entferne Player aus State
					gameState.update((state) => ({
						...state,
						players: state.players.filter((p) => p.id !== playerId)
					}));

					// Reset activePlayerId falls gelöschter Player aktiv war
					if ($activePlayerId === playerId) {
						activePlayerId.set(null);
					}

					// WebSocket Event senden
					adminWebSocket.send({
						type: 'admin:delete-player',
						payload: { playerId }
					});
				}
			} else {
				const error = await response.json();
				alert(`Fehler beim Löschen: ${error.error || 'Unbekannter Fehler'}`);
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Löschen des Spielers:', error);
			alert('Fehler beim Löschen des Spielers');
		}
	}

	async function handleResetGame() {
		if (!confirm('Möchtest du den Spielstand wirklich zurücksetzen? Alle Spieler, Punkte und der aktuelle Spielzustand werden zurückgesetzt. Die Matrix mit den Fragen bleibt erhalten.')) {
			return;
		}

		const currentToken = token || $page.url.searchParams.get('token');
		if (!currentToken) {
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}

		try {
			const response = await fetch('/api/game/reset', {
				method: 'POST',
				headers: {
					'X-Admin-Token': currentToken
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					// Reset local state - Matrix behalten aber Zellen zurücksetzen
					selectedCell.set(null);
					activePlayerId.set(null);
					gameState.update((state) => ({
						currentView: 'matrix',
						selectedQuestion: null,
						players: [],
						buzzerQueue: [],
						questionMatrix: state.questionMatrix.map(row => 
							row.map(cell => ({
								...cell,
								state: cell.state === 'completed' || cell.state === 'selected' ? 'available' : cell.state
							}))
						), // Matrix behalten, aber Zellen auf 'available' zurücksetzen
						gamePhase: 'idle'
					}));

					alert('Spielstand wurde erfolgreich zurückgesetzt! Die Matrix mit den Fragen bleibt erhalten.');
				}
			} else {
				const error = await response.json();
				alert(`Fehler beim Zurücksetzen: ${error.error || 'Unbekannter Fehler'}`);
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Zurücksetzen des Spiels:', error);
			alert('Fehler beim Zurücksetzen des Spiels');
		}
	}

	async function handleSyncMatrix() {
		const currentToken = token || $page.url.searchParams.get('token');
		if (!currentToken) {
			alert('Kein Admin-Token gefunden. Bitte Seite neu laden mit ?token=SECRET_TOKEN');
			return;
		}

		try {
			const response = await fetch('/api/game/sync-matrix', {
				method: 'POST',
				headers: {
					'X-Admin-Token': currentToken
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					// Reload game state to get updated matrix
					await loadGameState();
					alert(`Matrix synchronisiert! ${data.questionsCount} Fragen in ${data.categories?.length || 0} Kategorien.`);
				}
			} else {
				const error = await response.json();
				alert(`Fehler beim Synchronisieren: ${error.error || 'Unbekannter Fehler'}`);
			}
		} catch (error) {
			console.error('[Admin] Fehler beim Synchronisieren der Matrix:', error);
			alert('Fehler beim Synchronisieren der Matrix');
		}
	}

	$: matrix = $gameState.questionMatrix;
</script>

<div class="admin-panel">
	<header class="admin-header">
		<div class="header-brand">
			<i class="fas fa-gamepad header-icon"></i>
			<h1>Game Control</h1>
		</div>
		<div class="header-actions">
			<button class="btn-action btn-sync" on:click={handleSyncMatrix} title="Matrix aus DB neu laden">
				<i class="fas fa-sync-alt"></i>
				<span>Sync</span>
			</button>
			<button class="btn-action btn-reset" on:click={handleResetGame} title="Spiel komplett zurücksetzen">
				<i class="fas fa-redo-alt"></i>
				<span>Reset</span>
			</button>
			<a href="/admin/questions?token={token}" class="btn-action btn-questions" title="Fragen verwalten">
				<i class="fas fa-list-ul"></i>
				<span>Fragen</span>
			</a>
		</div>
	</header>

	<div class="admin-content">
		<div class="left-column">
			<MiniMatrix matrix={matrix} onCellClick={handleCellClick} />
		</div>

		<div class="right-column">
			<div class="right-top-row">
				<PlayerDashboard onScoreUpdate={handleScoreUpdate} onScoreSet={handleScoreSet} onDeletePlayer={handleDeletePlayer} />
				<BuzzerQueue onSelectPlayer={handleSelectPlayer} />
			</div>
			<div class="right-bottom-row">
				<QuestionControl onReturnToMatrix={handleReturnToMatrix} onRevealQuestion={handleRevealQuestion} />
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #0a0e12;
		color: #f5f0e1;
		font-family: 'Lato', -apple-system, BlinkMacSystemFont, sans-serif;
		overflow: hidden;
	}

	.admin-panel {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: 
			radial-gradient(ellipse at 20% 20%, rgba(139, 69, 19, 0.08) 0%, transparent 50%),
			radial-gradient(ellipse at 80% 80%, rgba(34, 139, 34, 0.06) 0%, transparent 50%),
			linear-gradient(180deg, #0a0e12 0%, #0f1419 100%);
		overflow: hidden;
		box-sizing: border-box;
	}

	.admin-header {
		flex-shrink: 0;
		height: 52px;
		padding: 0 1rem;
		background: linear-gradient(180deg, rgba(20, 25, 30, 0.95) 0%, rgba(15, 20, 25, 0.9) 100%);
		border-bottom: 1px solid rgba(212, 175, 55, 0.2);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		box-sizing: border-box;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.header-icon {
		color: rgba(212, 175, 55, 0.8);
		font-size: 0.9rem;
	}

	.admin-header h1 {
		margin: 0;
		font-family: 'Cinzel', serif;
		font-size: 0.9rem;
		font-weight: 600;
		color: #d4af37;
		letter-spacing: 0.08em;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.btn-action {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid transparent;
		border-radius: 6px;
		font-family: 'Lato', sans-serif;
		font-weight: 600;
		font-size: 0.8rem;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 36px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.btn-action i {
		font-size: 0.85rem;
		transition: transform 0.3s ease;
	}

	.btn-sync {
		background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
		color: #a8d5a2;
		border-color: rgba(45, 90, 61, 0.5);
	}

	.btn-sync:hover {
		background: linear-gradient(135deg, #2d5a3d 0%, #3d7a50 100%);
		border-color: rgba(61, 122, 80, 0.7);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(45, 90, 61, 0.4);
	}

	.btn-sync:hover i {
		transform: rotate(180deg);
	}

	.btn-sync:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.btn-reset {
		background: linear-gradient(135deg, #4a1a1a 0%, #6b2d2d 100%);
		color: #e8a0a0;
		border-color: rgba(107, 45, 45, 0.5);
	}

	.btn-reset:hover {
		background: linear-gradient(135deg, #6b2d2d 0%, #8b3d3d 100%);
		border-color: rgba(139, 61, 61, 0.7);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(107, 45, 45, 0.4);
	}

	.btn-reset:hover i {
		transform: rotate(-180deg);
	}

	.btn-reset:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.btn-questions {
		background: linear-gradient(135deg, #2a2a4a 0%, #3d3d6b 100%);
		color: #a0a0e8;
		border-color: rgba(61, 61, 107, 0.5);
		text-decoration: none;
	}

	.btn-questions:hover {
		background: linear-gradient(135deg, #3d3d6b 0%, #5050a0 100%);
		border-color: rgba(80, 80, 160, 0.7);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(61, 61, 107, 0.4);
	}

	.btn-questions:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.admin-content {
		flex: 1;
		display: grid;
		grid-template-columns: 45% 55%;
		gap: 0.5rem;
		padding: 0.5rem;
		min-height: 0;
		box-sizing: border-box;
	}

	.left-column {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.right-column {
		display: grid;
		grid-template-rows: 40% 60%;
		gap: 0.5rem;
		min-height: 0;
		overflow: hidden;
	}

	.right-top-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		min-height: 0;
		overflow: hidden;
	}

	.right-bottom-row {
		min-height: 0;
		overflow: hidden;
	}

	/* iPad Portrait Fallback */
	@media (orientation: portrait) and (max-width: 900px) {
		.admin-content {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.left-column {
			max-height: 40vh;
		}

		.right-column {
			grid-template-rows: auto auto;
		}

		.right-top-row {
			grid-template-columns: 1fr;
		}
	}

	/* Kleinere Tablets / Phones */
	@media (max-width: 600px) {
		.admin-header h1 {
			font-size: 0.9rem;
		}

		.btn-sync, .btn-reset {
			font-size: 0.75rem;
			padding: 0.3rem 0.5rem;
		}
	}

	/* Touch-optimierte Buttons */
	:global(.admin-button) {
		min-height: 44px;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border-radius: 8px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
</style>
