<script lang="ts">
	/**
	 * Player Dashboard Component
	 * SOLID-Prinzip: Single Responsibility - Nur Spieler-Anzeige und Score-Kontrolle
	 * Agent 2 Bereich
	 */
	import type { Player, Question } from '$lib/shared';
	import { sortedPlayers, activePlayerId, currentQuestion } from '../stores/adminState';

	export let onScoreUpdate: (playerId: string, delta: number) => void = () => {};
	export let onDeletePlayer: (playerId: string) => void = () => {};

	$: players = $sortedPlayers;
	$: activeId = $activePlayerId;
	$: question = $currentQuestion;

	function updateScore(playerId: string, delta: number) {
		onScoreUpdate(playerId, delta);
	}

	function deletePlayer(playerId: string) {
		if (confirm('Möchtest du diesen Spieler wirklich löschen?')) {
			onDeletePlayer(playerId);
		}
	}
</script>

<div class="player-dashboard">
	<h2 class="dashboard-title">👥 SPIELER</h2>
	<div class="player-list">
		{#if players.length === 0}
			<div class="no-players">
				<p>Noch keine Spieler registriert</p>
			</div>
		{:else}
			{#each players as player (player.id)}
				{@const isActive = player.id === activeId}
				{@const points = question?.points || 0}
				<div class="player-card" class:active={isActive}>
					<div class="player-info">
						<span class="player-name">{player.name}</span>
						<span class="player-score">{player.score}</span>
					</div>
					<div class="player-controls">
						<div class="score-controls">
							<button
								class="btn-add"
								on:click={() => updateScore(player.id, points)}
								disabled={!question || points === 0}
							>
								+{points}
							</button>
							<button
								class="btn-subtract"
								on:click={() => updateScore(player.id, -points)}
								disabled={!question || points === 0}
							>
								-{points}
							</button>
						</div>
						<button
							class="btn-delete"
							on:click={() => deletePlayer(player.id)}
							title="Spieler löschen"
						>
							🗑️
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.player-dashboard {
		padding: 1rem;
		background: rgba(15, 20, 25, 0.3);
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.dashboard-title {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		color: #fff8dc;
		text-align: center;
	}

	.player-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.player-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		border-left: 4px solid transparent;
		transition: all 0.2s ease;
	}

	.player-card.active {
		border-left-color: #ffd700;
		background: rgba(255, 215, 0, 0.1);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.player-name {
		font-weight: bold;
		font-size: 1rem;
		color: #fff8dc;
	}

	.player-score {
		font-size: 1.2rem;
		font-weight: bold;
		color: #ffd700;
	}

	.player-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.score-controls {
		display: flex;
		gap: 0.5rem;
	}

	.score-controls button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
		touch-action: manipulation;
		font-size: 1rem;
	}

	.btn-add {
		background: linear-gradient(135deg, #228b22, #32cd32);
		color: white;
	}

	.btn-add:hover:not(:disabled) {
		background: linear-gradient(135deg, #32cd32, #228b22);
		transform: scale(1.05);
	}

	.btn-subtract {
		background: linear-gradient(135deg, #dc143c, #ff6347);
		color: white;
	}

	.btn-subtract:hover:not(:disabled) {
		background: linear-gradient(135deg, #ff6347, #dc143c);
		transform: scale(1.05);
	}

	.score-controls button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-delete {
		background: rgba(220, 20, 60, 0.3);
		border: 2px solid #dc143c;
		color: #fff8dc;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
		min-width: 44px;
		font-size: 1.2rem;
		touch-action: manipulation;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-delete:hover {
		background: rgba(220, 20, 60, 0.5);
		transform: scale(1.1);
	}

	.btn-delete:active {
		transform: scale(0.95);
	}

	.no-players {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 248, 220, 0.5);
	}
</style>

