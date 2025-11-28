<script lang="ts">
	/**
	 * GAME VIEW - Elegant Christmas Quiz Display
	 * Für Beamer/TV Präsentation
	 */
	import { onMount, onDestroy } from 'svelte';
	import { gameViewState } from '$lib/game-view/stores/gameViewState';
	import { gameViewWebSocket } from '$lib/game-view/services/gameViewWebSocket';
	import GameHeader from '$lib/game-view/components/GameHeader.svelte';
	import Matrix from '$lib/game-view/components/Matrix.svelte';
	import Question from '$lib/game-view/components/Question.svelte';

	const connectionStatus = gameViewWebSocket.connectionStatus;

	onMount(() => {
		gameViewWebSocket.connect();

		gameViewWebSocket.onError((error) => {
			console.error('[Game View] WebSocket Fehler:', error);
			loadGameState();
		});

		const stateInterval = setInterval(() => {
			loadGameState();
		}, 2000);

		loadGameState();

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
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
</svelte:head>

<div class="game-view">
	<!-- Ambient Light Effects -->
	<div class="ambient-glow glow-1"></div>
	<div class="ambient-glow glow-2"></div>

	<!-- Header with Scoreboard -->
	<GameHeader />

	<!-- Connection Status (subtle) -->
	<div class="connection-indicator" class:connected={$connectionStatus === 'connected'}>
		<span class="status-dot"></span>
		<span class="status-label">
			{#if $connectionStatus === 'connected'}
				Verbunden
			{:else}
				Verbinde...
			{/if}
		</span>
	</div>

	<!-- Main Content -->
	<main class="main-content">
		{#if currentView === 'matrix'}
			<Matrix {matrix} />
		{:else if currentView === 'question'}
			<Question question={selectedQuestion} />
		{/if}
	</main>

	<!-- Loading Overlay -->
	{#if $connectionStatus === 'connecting' && matrix.length === 0}
		<div class="loading-overlay">
			<div class="loading-content">
				<div class="loading-tree">🎄</div>
				<div class="loading-spinner"></div>
				<p class="loading-text">Lade Weihnachts-Quiz...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		background: #0a1520;
	}

	.game-view {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
		background: 
			url('/background2.png') no-repeat center center fixed;
		background-size: cover;
		color: #fff8dc;
	}

	/* Add a subtle overlay for better text readability */
	.game-view::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(10, 21, 32, 0.3) 0%,
			rgba(10, 21, 32, 0.1) 50%,
			rgba(10, 21, 32, 0.4) 100%
		);
		pointer-events: none;
		z-index: 0;
	}

	/* Ambient Glow Effects */
	.ambient-glow {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		pointer-events: none;
		z-index: 0;
	}

	.glow-1 {
		width: 600px;
		height: 600px;
		background: rgba(212, 175, 55, 0.08);
		top: -200px;
		right: -200px;
		animation: float-glow 20s ease-in-out infinite;
	}

	.glow-2 {
		width: 500px;
		height: 500px;
		background: rgba(220, 20, 60, 0.05);
		bottom: -150px;
		left: -150px;
		animation: float-glow 25s ease-in-out infinite reverse;
	}

	@keyframes float-glow {
		0%, 100% { transform: translate(0, 0); }
		50% { transform: translate(30px, 30px); }
	}

	/* Main Content */
	.main-content {
		position: absolute;
		top: 80px; /* Header height */
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		z-index: 1;
	}

	/* Connection Indicator */
	.connection-indicator {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.8rem;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 20px;
		font-size: 0.75rem;
		z-index: 100;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		opacity: 0.6;
		transition: all 0.3s ease;
	}

	.connection-indicator:hover {
		opacity: 1;
	}

	.connection-indicator.connected {
		border-color: rgba(34, 139, 34, 0.5);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 165, 0, 0.8);
		animation: blink 1.5s infinite;
	}

	.connection-indicator.connected .status-dot {
		background: #32cd32;
		animation: none;
		box-shadow: 0 0 8px rgba(50, 205, 50, 0.5);
	}

	.status-label {
		color: rgba(255, 248, 220, 0.7);
	}

	/* Loading Overlay */
	.loading-overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, 
			rgba(10, 21, 32, 0.98) 0%,
			rgba(15, 35, 50, 0.98) 100%
		);
		z-index: 9999;
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.loading-tree {
		font-size: 4rem;
		animation: bounce 1s ease-in-out infinite;
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #d4af37;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-family: 'Georgia', serif;
		font-size: 1.3rem;
		color: #fff8dc;
		letter-spacing: 0.1em;
		margin: 0;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	/* Responsive */
	@media (max-width: 1100px) {
		.main-content {
			top: 70px;
		}
	}
</style>
