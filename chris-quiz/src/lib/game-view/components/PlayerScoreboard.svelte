<script lang="ts">
	/**
	 * Player Scoreboard Component für Game View
	 * SOLID-Prinzip: Single Responsibility - Nur Scoreboard-Anzeige
	 * Agent 1 Bereich
	 */
	import type { Player } from '$lib/shared';
	import { sortedPlayers } from '../stores/gameViewState';

	$: players = $sortedPlayers;

	function getRankIcon(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return '';
	}
</script>

<div class="scoreboard">
	<div class="scoreboard-title">📊 PUNKTESTAND</div>
	<div class="scoreboard-list">
		{#each players as player, index (player.id)}
			<div class="scoreboard-entry" class:top-three={index < 3}>
				<span class="rank">{getRankIcon(index)}</span>
				<span class="name">{player.name}</span>
				<span class="score">{player.score}</span>
			</div>
		{/each}
		{#if players.length === 0}
			<div class="empty-state">Noch keine Spieler</div>
		{/if}
	</div>
</div>

<style>
	.scoreboard {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 200px;
		max-width: 300px;
	}

	.scoreboard-title {
		font-size: 0.9rem;
		font-weight: bold;
		color: var(--color-christmas-gold);
		text-align: center;
		padding: 0.25rem 0;
		border-bottom: 1px solid rgba(255, 215, 0, 0.3);
	}

	.scoreboard-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.scoreboard-entry {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		font-size: 0.85rem;
		transition: all 0.2s ease;
	}

	.scoreboard-entry.top-three {
		background: rgba(255, 215, 0, 0.1);
		border: 1px solid rgba(255, 215, 0, 0.3);
	}

	.scoreboard-entry:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.rank {
		font-size: 1rem;
		width: 1.5rem;
		text-align: center;
	}

	.name {
		flex: 1;
		color: var(--color-light-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.score {
		font-weight: bold;
		color: var(--color-christmas-gold);
		font-family: 'Courier New', monospace;
		min-width: 3rem;
		text-align: right;
	}

	.empty-state {
		padding: 0.5rem;
		text-align: center;
		color: rgba(255, 248, 220, 0.5);
		font-size: 0.8rem;
	}

	/* Scrollbar Styling */
	.scoreboard-list::-webkit-scrollbar {
		width: 4px;
	}

	.scoreboard-list::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
	}

	.scoreboard-list::-webkit-scrollbar-thumb {
		background: rgba(255, 215, 0, 0.3);
		border-radius: 2px;
	}

	.scoreboard-list::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 215, 0, 0.5);
	}
</style>

