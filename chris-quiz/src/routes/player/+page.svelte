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
	import { playerState, setPlayer, updatePlayers, logout, setCurrentQuestion, setBuzzerEnabled, setBuzzed } from '$lib/player-view/stores/playerState';
	import { playerWebSocket } from '$lib/player-view/services/playerWebSocket';
	import type { Player } from '$lib/shared';

	// Reaktive Variablen direkt aus Store
	$: currentView = $playerState.currentView;
	$: players = $playerState.players;
	$: playerId = $playerState.playerId;
	$: playerName = $playerState.playerName;
	$: buzzerEnabled = $playerState.buzzerEnabled;
	$: buzzed = $playerState.buzzed;
	$: buzzerPosition = $playerState.buzzerPosition;

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

	// Grace Period in ms - nach einem WebSocket-Update wird das Polling für Buzzer-Status ignoriert
	const WEBSOCKET_GRACE_PERIOD = 1500;

	async function loadGameState() {
		try {
			const response = await fetch('/api/game/state');
			if (response.ok) {
				const data = await response.json();
				const players: Player[] = Array.isArray(data.players) ? data.players : [];
				
				// WICHTIG: Prüfe ob der eingeloggte Spieler noch existiert
				// Nach Game-Reset existiert der Spieler nicht mehr auf dem Server
				if (playerId) {
					const playerExists = players.some(p => p.id === playerId);
					if (!playerExists) {
						console.log('[Player View] Spieler existiert nicht mehr auf Server - Logout');
						// Automatischer Logout wenn Spieler nicht mehr existiert
						playerWebSocket.disconnect();
						logout();
						return;
					}
				}
				
				updatePlayers(players);
				setCurrentQuestion(data.selectedQuestion || null);
				
				// WICHTIG: Prüfe ob kürzlich ein WebSocket-Update kam
				// Wenn ja, überschreibe Buzzer-Status NICHT - WebSocket hat Priorität!
				const currentState = $playerState;
				const timeSinceLastWsUpdate = Date.now() - currentState.lastWebSocketUpdate;
				const isWithinGracePeriod = timeSinceLastWsUpdate < WEBSOCKET_GRACE_PERIOD;
				
				if (!isWithinGracePeriod) {
					// Außerhalb der Grace Period: Buzzer-Status von Server übernehmen
					setBuzzerEnabled(data.currentView === 'question-hidden', false);
				}
				// Innerhalb der Grace Period: Buzzer-Status NICHT überschreiben!
				
				// Setze Buzzer-Position (das kann immer aktualisiert werden)
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
		<div class="game-screen">
			<!-- Schneeflocken Hintergrund -->
			<div class="snowflakes" aria-hidden="true">
				{#each Array(10) as _, i}
					<div class="snowflake" style="--i: {i}">❄</div>
				{/each}
			</div>
			
			<!-- Header -->
			<header class="game-header">
				<div class="player-info">
					<span class="player-icon">🎅</span>
					<span class="player-name">{playerName}</span>
				</div>
				<button class="logout-btn" on:click={handleLogout} type="button" aria-label="Abmelden">
					<span class="logout-icon">✕</span>
				</button>
			</header>

			<!-- Main Content -->
			<main class="game-content">
				<!-- Buzzer - Hauptbereich -->
				<div class="buzzer-area">
					<Buzzer
						enabled={buzzerEnabled}
						buzzed={buzzed}
						position={buzzerPosition}
						onPress={handleBuzzerPress}
					/>
				</div>
				
				<!-- Scoreboard - Unten -->
				<div class="scoreboard-area">
					<Scoreboard {players} currentPlayerId={playerId} />
				</div>
			</main>
		</div>
	{/if}
</div>

<style>
	/* === BASE === */
	.player-view {
		position: fixed;
		inset: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
	}

	/* === GAME SCREEN === */
	.game-screen {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, 
			#0d1b2a 0%, 
			#1b263b 40%, 
			#2d3a4f 100%
		);
		overflow: hidden;
	}

	/* === SCHNEEFLOCKEN === */
	.snowflakes {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.snowflake {
		position: absolute;
		top: -20px;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.4);
		animation: fall linear infinite;
		animation-duration: calc(10s + var(--i) * 3s);
		animation-delay: calc(var(--i) * -2s);
		left: calc(var(--i) * 10%);
		opacity: calc(0.2 + var(--i) * 0.04);
	}

	@keyframes fall {
		0% { transform: translateY(-20px) rotate(0deg); }
		100% { transform: translateY(100vh) rotate(360deg); }
	}

	/* === HEADER === */
	.game-header {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		padding-top: max(0.75rem, env(safe-area-inset-top));
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.player-info {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.player-icon {
		font-size: 1.5rem;
	}

	.player-name {
		color: #fbbf24;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.logout-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.4);
		border-radius: 10px;
		color: #fca5a5;
		font-size: 1rem;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition: all 0.2s ease;
	}

	.logout-btn:active {
		transform: scale(0.95);
		background: rgba(239, 68, 68, 0.3);
	}

	.logout-icon {
		font-weight: bold;
	}

	/* === MAIN CONTENT === */
	.game-content {
		position: relative;
		z-index: 1;
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
		gap: 1rem;
		min-height: 0;
	}

	/* === BUZZER AREA === */
	.buzzer-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
	}

	/* === SCOREBOARD AREA === */
	.scoreboard-area {
		flex-shrink: 0;
		max-height: 200px;
		overflow: hidden;
	}

	/* === KLEINE BILDSCHIRME (iPhone SE) === */
	@media (max-height: 667px) {
		.game-content {
			padding: 0.75rem;
			gap: 0.75rem;
		}

		.scoreboard-area {
			max-height: 160px;
		}
	}

	/* === LANDSCAPE MODE === */
	@media (orientation: landscape) and (max-height: 500px) {
		.game-content {
			flex-direction: row;
			padding: 0.5rem 1rem;
		}

		.buzzer-area {
			flex: 0 0 55%;
		}

		.scoreboard-area {
			flex: 0 0 45%;
			max-height: none;
			overflow-y: auto;
		}
	}
</style>
