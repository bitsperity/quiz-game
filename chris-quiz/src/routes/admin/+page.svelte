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
	onMount(async () => {
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

		// Initial State laden
		loadGameState();

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
							: Array.from(state.players?.values() || []),
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
					currentView: 'question-hidden',
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

	$: matrix = $gameState.questionMatrix;
</script>

<div class="admin-panel">
	<header class="admin-header">
		<h1>🎄 ADMIN CONTROL PANEL 🎄</h1>
		<button class="btn-reset" on:click={handleResetGame} title="Spiel komplett zurücksetzen">
			🔄 RESET GAME
		</button>
	</header>

	<div class="admin-content">
		<div class="left-column">
			<MiniMatrix matrix={matrix} onCellClick={handleCellClick} />
		</div>

		<div class="right-column">
			<PlayerDashboard onScoreUpdate={handleScoreUpdate} onDeletePlayer={handleDeletePlayer} />
			<BuzzerQueue onSelectPlayer={handleSelectPlayer} />
			<QuestionControl
				onReturnToMatrix={handleReturnToMatrix}
			/>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #0f1419;
		color: #fff8dc;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
	}

	.admin-panel {
		min-height: 100vh;
		padding: 1rem;
		background: linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(34, 139, 34, 0.1) 100%);
		border: 2px solid rgba(255, 215, 0, 0.3);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.admin-header {
		text-align: center;
		padding: 1rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid rgba(255, 215, 0, 0.3);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.admin-header h1 {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		color: #ffd700;
		text-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
		flex: 1;
	}

	.btn-reset {
		background: linear-gradient(135deg, #dc143c, #ff6347);
		color: white;
		border: 2px solid #dc143c;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: bold;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
		touch-action: manipulation;
		box-shadow: 0 2px 8px rgba(220, 20, 60, 0.3);
	}

	.btn-reset:hover {
		background: linear-gradient(135deg, #ff6347, #dc143c);
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(220, 20, 60, 0.5);
	}

	.btn-reset:active {
		transform: scale(0.95);
	}

	.admin-content {
		display: grid;
		grid-template-columns: 40% 60%;
		gap: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.left-column {
		display: flex;
		flex-direction: column;
	}

	.right-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* iPad Portrait Optimierung */
	@media (max-width: 768px) {
		.admin-content {
			grid-template-columns: 1fr;
		}

		.left-column,
		.right-column {
			width: 100%;
		}
	}

	/* Touch-optimierte Buttons */
	:global(.admin-button) {
		min-height: 44px;
		padding: 0.75rem 1.5rem;
		font-size: 1.1rem;
		border-radius: 8px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
</style>
