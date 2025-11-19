<script lang="ts">
	/**
	 * AGENT 1 BEREICH: Game View
	 * SOLID-Prinzip: Single Responsibility - Nur Game View Logik
	 * Unabhängig von Admin und Player View
	 */
	import { onMount, onDestroy } from 'svelte';
	import { gameViewState } from '$lib/game-view/stores/gameViewState';
	import { gameViewWebSocket } from '$lib/game-view/services/gameViewWebSocket';
	import GameHeader from '$lib/game-view/components/GameHeader.svelte';
	import Matrix from '$lib/game-view/components/Matrix.svelte';
	import Question from '$lib/game-view/components/Question.svelte';

	// Store für Verbindungsstatus
	const connectionStatus = gameViewWebSocket.connectionStatus;

	onMount(() => {
		// WebSocket verbinden
		gameViewWebSocket.connect();

		// Status-Handler für Fehler
		gameViewWebSocket.onError((error) => {
			console.error('[Game View] WebSocket Fehler:', error);
			// Fallback: Lade Daten über REST API wenn WebSocket fehlschlägt
			loadGameState();
		});

		// Polling nur noch für GameState Updates als Backup, nicht mehr für Status
		const stateInterval = setInterval(() => {
			loadGameState();
		}, 2000);

		// Initial State laden
		loadGameState();

		// Cleanup
		return () => {
			clearInterval(stateInterval);
		};
	});

	async function loadGameState() {
		try {
			const response = await fetch('/api/game/state');
			if (response.ok) {
				const data = await response.json();
				
				gameViewState.set({
					currentView:
						data.currentView === 'question-hidden'
							? 'question'
							: 'matrix',
					selectedQuestion: data.selectedQuestion || null,
					selectedAnswer: null,
					buzzerQueue: Array.isArray(data.buzzerQueue) ? data.buzzerQueue : [],
					players: Array.isArray(data.players) ? data.players : [],
					matrix: Array.isArray(data.questionMatrix) ? data.questionMatrix : [],
					categories: Array.isArray(data.categories) ? data.categories : [],
					gamePhase: data.gamePhase || 'idle'
				});
			}
		} catch (error) {
			console.error('[Game View] Fehler beim Laden des Game States:', error);
		}
	}

	onDestroy(() => {
		gameViewWebSocket.disconnect();
	});

	$: currentView = $gameViewState.currentView;
	$: selectedQuestion = $gameViewState.selectedQuestion;
	$: matrix = $gameViewState.matrix;
</script>

<svelte:head>
	<title>🎄 Weihnachts-Quiz - Game View</title>
</svelte:head>

<div class="game-view">
	<!-- Fixed Header mit Scoreboard -->
	<GameHeader />

	<!-- Connection Status Badge -->
	<div class="connection-status" class:connected={$connectionStatus === 'connected'} class:disconnected={$connectionStatus === 'disconnected'} class:error={$connectionStatus === 'error'}>
		<span class="status-dot"></span>
		<span class="status-text">
			{#if $connectionStatus === 'connected'}
				Verbunden
			{:else if $connectionStatus === 'disconnected'}
				Verbindung getrennt
			{:else if $connectionStatus === 'error'}
				Fehler
			{:else}
				Verbinde...
			{/if}
		</span>
	</div>

	<!-- Main Content Area (mit Header-Offset) -->
	<main class="main-content">
		<!-- View Switch -->
		{#if currentView === 'matrix'}
			<Matrix {matrix} />
		{:else if currentView === 'question'}
			<Question question={selectedQuestion} />
		{/if}
	</main>

	<!-- Loading State -->
	{#if $connectionStatus === 'connecting' && matrix.length === 0}
		<div class="loading-overlay">
			<div class="loading-spinner"></div>
			<p>Lade Spielzustand...</p>
		</div>
	{/if}
</div>

<style>
	.game-view {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
		background: url('/background.png') no-repeat center center fixed;
		background-size: cover;
		color: var(--color-light-text);
		display: flex;
		flex-direction: column;
	}

	.main-content {
		position: absolute !important;
		top: 120px !important; /* Header Höhe */
		left: 0 !important;
		right: 0 !important;
		bottom: 0 !important;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 100%;
		height: calc(100vh - 120px);
	}

	.connection-status {
		position: fixed;
		top: 130px; /* Unter dem Header */
		left: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 8px;
		font-size: 0.9rem;
		z-index: 1000;
		backdrop-filter: blur(10px);
		border: 2px solid;
	}

	.connection-status.connected {
		border-color: var(--color-christmas-green);
	}

	.connection-status.disconnected {
		border-color: var(--color-christmas-red);
	}

	.connection-status.error {
		border-color: var(--color-christmas-red);
		animation: pulse 1s infinite;
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: currentColor;
		animation: blink 1.5s infinite;
	}

	.connection-status.connected .status-dot {
		background: var(--color-christmas-green);
		animation: none;
	}

	.connection-status.disconnected .status-dot,
	.connection-status.error .status-dot {
		background: var(--color-christmas-red);
	}

	.status-text {
		color: var(--color-light-text);
	}

	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--color-dark-bg);
		z-index: 9999;
		gap: 2rem;
	}

	.loading-spinner {
		width: 60px;
		height: 60px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: var(--color-christmas-gold);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-overlay p {
		font-size: clamp(1.5rem, 3vw, 2rem);
		color: var(--color-light-text);
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
