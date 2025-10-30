<script lang="ts">
	/**
	 * Score Display Component
	 * Zeigt Score-Änderungen während Answer View
	 * SOLID-Prinzip: Single Responsibility - Nur Score-Updates Anzeige
	 */
	import { gameViewState } from '../stores/gameViewState';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface ScoreUpdate {
		playerId: string;
		playerName: string;
		delta: number;
		timestamp: number;
	}

	let scoreUpdates: ScoreUpdate[] = [];
	let previousScores: Map<string, number> = new Map();

	$: {
		// Track Score-Änderungen
		const currentPlayers = $gameViewState.players;
		if (currentPlayers.length > 0) {
			currentPlayers.forEach((player) => {
				const previousScore = previousScores.get(player.id) || 0;
				if (previousScore !== player.score && previousScores.size > 0) {
					const delta = player.score - previousScore;
					if (delta !== 0) {
						const timestamp = Date.now();
						scoreUpdates = [
							...scoreUpdates,
							{
								playerId: player.id,
								playerName: player.name,
								delta,
								timestamp
							}
						];

						// Entferne Update nach 3 Sekunden
						setTimeout(() => {
							scoreUpdates = scoreUpdates.filter((update) => update.timestamp !== timestamp);
						}, 3000);
					}
				}
				previousScores.set(player.id, player.score);
			});
		}
	}

	onMount(() => {
		// Initialisiere previousScores
		$gameViewState.players.forEach((player) => {
			previousScores.set(player.id, player.score);
		});
	});
</script>

{#if $gameViewState.currentView === 'answer' && scoreUpdates.length > 0}
	<div class="score-display-container">
		{#each scoreUpdates as update (update.timestamp)}
			<div
				class="score-update"
				class:positive={update.delta > 0}
				class:negative={update.delta < 0}
				transition:fly={{ y: -20, duration: 300 }}
			>
				<span class="player-name">{update.playerName}</span>
				<span class="score-delta">
					{update.delta > 0 ? '+' : ''}{update.delta}
				</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.score-display-container {
		position: fixed;
		top: 2rem;
		right: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 1000;
		max-width: 300px;
	}

	.score-update {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 8px;
		font-size: clamp(1.2rem, 2vw, 1.8rem);
		font-weight: bold;
		border: 2px solid;
		backdrop-filter: blur(10px);
		animation: fadeIn 0.3s ease-in;
	}

	.score-update.positive {
		border-color: var(--color-christmas-green);
		color: var(--color-christmas-green);
	}

	.score-update.positive .score-delta::before {
		content: '↑ ';
	}

	.score-update.negative {
		border-color: var(--color-christmas-red);
		color: var(--color-christmas-red);
	}

	.score-update.negative .score-delta::before {
		content: '↓ ';
	}

	.player-name {
		flex: 1;
		color: var(--color-light-text);
	}

	.score-delta {
		font-family: 'Courier New', monospace;
		margin-left: 1rem;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>

