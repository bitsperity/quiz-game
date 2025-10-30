<script lang="ts">
	/**
	 * AGENT 3 BEREICH: Player View
	 * SOLID-Prinzip: Single Responsibility - Nur Player Interaction Logik
	 * Unabhängig von Game und Admin View
	 */
	import { onMount, onDestroy } from 'svelte';
	import Login from '$lib/player-view/components/Login.svelte';
	import Scoreboard from '$lib/player-view/components/Scoreboard.svelte';
	import Buzzer from '$lib/player-view/components/Buzzer.svelte';
	import Question from '$lib/player-view/components/Question.svelte';
	import { playerState, setPlayer, updatePlayers, logout, setCurrentQuestion, setBuzzerEnabled, setBuzzed } from '$lib/player-view/stores/playerState';
	import { playerWebSocket } from '$lib/player-view/services/playerWebSocket';
	import type { Player, Question } from '$lib/shared';

	// Reaktive Variablen direkt aus Store
	$: currentView = $playerState.currentView;
	$: players = $playerState.players;
	$: playerId = $playerState.playerId;
	$: playerName = $playerState.playerName;
	$: buzzerEnabled = $playerState.buzzerEnabled;
	$: buzzed = $playerState.buzzed;
	$: buzzerPosition = $playerState.buzzerPosition;
	$: currentQuestion = $playerState.currentQuestion;

	async function handleLogin(name: string) {
		try {
			const response = await fetch('/api/players/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Registrierung fehlgeschlagen');
			}

			const data = await response.json();
			const player: Player = data.player;

			// Player im State speichern (setzt currentView auf 'game')
			setPlayer(player);

			// WebSocket verbinden - der Server sendet automatisch state:sync beim Verbinden
			// und nach der Registrierung nochmal, damit alle Daten synchronisiert sind
			// connect() setzt automatisch isRegistering Flag wenn playerId übergeben wird
			playerWebSocket.connect(player.id);
			
			// Lade State von REST API (Single Source of Truth)
			await loadGameState();
		} catch (err) {
			const error = err as Error;
			throw new Error(error.message || 'Registrierung fehlgeschlagen');
		}
	}

	async function handleBuzzerPress() {
		if (!playerId || buzzed || !buzzerEnabled) {
			return;
		}

		// Sende Buzzer-Request über REST API (Single Source of Truth)
		await playerWebSocket.buzz();
	}

	async function handleLogout() {
		try {
			// Sende Logout-Request an Server
			if (playerId) {
				await fetch('/api/players/logout', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ playerId })
				});
			}
		} catch (error) {
			console.error('[Logout] Fehler beim Logout:', error);
		} finally {
			playerWebSocket.disconnect();
			logout();
		}
	}

	async function loadGameState() {
		try {
			const response = await fetch('/api/game/state');
			if (response.ok) {
				const data = await response.json();
				const players: Player[] = Array.isArray(data.players) ? data.players : [];
				updatePlayers(players);
				setCurrentQuestion(data.selectedQuestion || null);
				setBuzzerEnabled(data.currentView === 'question-hidden');
				
				// Setze Buzzer-Position
				if (playerId && Array.isArray(data.buzzerQueue)) {
					const buzzerIndex = data.buzzerQueue.findIndex(
						(entry: { playerId: string }) => entry.playerId === playerId
					);
					setBuzzed(buzzerIndex >= 0 ? buzzerIndex + 1 : null);
				}
			}
		} catch (error) {
			console.error('[Player View] Fehler beim Laden des Game States:', error);
		}
	}

	onMount(() => {
		// Prüfe ob bereits eingeloggt und verbinde WebSocket
		const state = $playerState;
		if (state.loggedIn && state.playerId && state.playerName) {
			// Verbinde WebSocket - wird automatisch Re-Registrierung senden
			playerWebSocket.connect(state.playerId);
			// Lade initial State von REST API (Single Source of Truth)
			void loadGameState();
		}

		// Polling: Aktualisiere State alle 2 Sekunden (Single Source of Truth)
		// WebSocket Events sind nur Benachrichtigungen, REST API ist die Wahrheit
		const pollingInterval = setInterval(() => {
			if ($playerState.loggedIn) {
				loadGameState();
			}
		}, 2000);

		// Cleanup
		return () => {
			clearInterval(pollingInterval);
		};
	});

	onDestroy(() => {
		playerWebSocket.disconnect();
	});
</script>

<div class="player-view">
	{#if currentView === 'login'}
		<Login onSubmit={handleLogin} />
	{:else if currentView === 'game'}
		<div class="game-container">
			<header class="header">
				<h1 class="title">🎄 WEIHNACHTS-QUIZ 🎄</h1>
				<div class="header-info">
					{#if playerId && playerName}
						<p class="player-name">Spieler: {playerName}</p>
					{/if}
					<button class="logout-button" on:click={handleLogout} type="button">
						🚪 Abmelden
					</button>
				</div>
			</header>

			<main class="main-content">
				{#if currentQuestion}
					<div class="question-section">
						<Question question={currentQuestion} />
					</div>
				{/if}

				<div class="scoreboard-section">
					<Scoreboard {players} currentPlayerId={playerId} />
				</div>

				<div class="buzzer-section">
					<Buzzer
						enabled={buzzerEnabled}
						buzzed={buzzed}
						position={buzzerPosition}
						onPress={handleBuzzerPress}
					/>
				</div>
			</main>
		</div>
	{/if}
</div>

<style>
	.player-view {
		min-height: 100vh;
		width: 100%;
		background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
	}

	.game-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 1rem;
	}

	.header {
		text-align: center;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.title {
		color: #ffd700;
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	.header-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.player-name {
		color: #fff8dc;
		font-size: 0.9rem;
		margin: 0;
		opacity: 0.8;
		flex: 1;
	}

	.logout-button {
		padding: 0.5rem 1rem;
		background: rgba(220, 20, 60, 0.3);
		border: 2px solid #dc143c;
		border-radius: 8px;
		color: #fff8dc;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s ease;
		touch-action: manipulation;
		min-height: 36px;
	}

	.logout-button:hover {
		background: rgba(220, 20, 60, 0.5);
		transform: scale(1.05);
	}

	.logout-button:active {
		transform: scale(0.95);
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.question-section {
		flex: 0 0 auto;
	}

	.scoreboard-section {
		flex: 0 0 auto;
	}

	.buzzer-section {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}

	/* Mobile Optimierungen */
	@media (max-width: 480px) {
		.game-container {
			padding: 0.75rem;
		}

		.title {
			font-size: 1.25rem;
		}

		.player-name {
			font-size: 0.85rem;
		}
	}

	/* Landscape Mode */
	@media (orientation: landscape) and (max-height: 500px) {
		.main-content {
			flex-direction: row;
		}

		.scoreboard-section {
			flex: 0 0 40%;
		}

		.buzzer-section {
			flex: 0 0 60%;
		}
	}

	/* Tablet und größer */
	@media (min-width: 768px) {
		.game-container {
			max-width: 600px;
			margin: 0 auto;
		}
	}
</style>
