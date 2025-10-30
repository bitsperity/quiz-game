<script lang="ts">
	/**
	 * Scoreboard Component
	 * SOLID-Prinzip: Single Responsibility - Nur Scoreboard-Anzeige
	 * Agent 3 Bereich
	 */
	import type { Player } from '$lib/shared';
	
	export let players: Player[] = [];
	export let currentPlayerId: string | null = null;
	
	$: sortedPlayers = [...players].sort((a, b) => b.score - a.score);
	
	function getRankIcon(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return '';
	}
	
	function getRankText(index: number): string {
		return `${index + 1}.`;
	}
</script>

<div class="scoreboard">
	<h2 class="scoreboard-title">📊 PUNKTESTAND</h2>
	
	<div class="scoreboard-list">
		{#each sortedPlayers as player, index (player.id)}
			<div
				class="scoreboard-entry"
				class:current-player={player.id === currentPlayerId}
				class:top-three={index < 3}
			>
				<span class="rank">{getRankIcon(index)}</span>
				<span class="rank-number">{getRankText(index)}</span>
				<span class="name">{player.name}</span>
				<span class="score">{player.score}</span>
				{#if player.id === currentPlayerId}
					<span class="you-badge">⭐ Du</span>
				{/if}
			</div>
		{/each}
		
		{#if sortedPlayers.length === 0}
			<div class="empty-state">
				<p>Noch keine Spieler registriert</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.scoreboard {
		width: 100%;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(255, 215, 0, 0.2);
	}
	
	.scoreboard-title {
		text-align: center;
		color: #ffd700;
		font-size: 1.25rem;
		margin-bottom: 1rem;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}
	
	.scoreboard-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.scoreboard-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		transition: all 0.3s ease;
		gap: 0.5rem;
		border: 2px solid transparent;
	}
	
	.scoreboard-entry:hover {
		background: rgba(255, 255, 255, 0.08);
	}
	
	.scoreboard-entry.current-player {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
		border: 2px solid #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
		transform: scale(1.02);
	}
	
	.scoreboard-entry.top-three {
		font-weight: bold;
	}
	
	.rank {
		font-size: 1.5rem;
		width: 2rem;
		text-align: center;
	}
	
	.rank-number {
		font-size: 0.9rem;
		color: rgba(255, 248, 220, 0.6);
		width: 2rem;
		text-align: left;
	}
	
	.name {
		flex: 1;
		color: #fff8dc;
		font-size: 1rem;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.score {
		font-size: 1.5rem;
		font-weight: bold;
		color: #ffd700;
		margin-left: auto;
		margin-right: 0.5rem;
		min-width: 3rem;
		text-align: right;
	}
	
	.you-badge {
		color: #ffd700;
		font-size: 0.9rem;
		font-weight: bold;
		margin-left: 0.5rem;
	}
	
	.empty-state {
		text-align: center;
		padding: 2rem;
		color: rgba(255, 248, 220, 0.5);
		font-size: 0.9rem;
	}
	
	/* Animations für Score-Updates */
	@keyframes scoreUpdate {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
	}
	
	.scoreboard-entry.updating .score {
		animation: scoreUpdate 0.5s ease;
	}
	
	/* Mobile Optimierungen */
	@media (max-width: 480px) {
		.scoreboard {
			padding: 0.75rem;
		}
		
		.scoreboard-title {
			font-size: 1.1rem;
		}
		
		.scoreboard-entry {
			padding: 0.625rem;
		}
		
		.name {
			font-size: 0.9rem;
		}
		
		.score {
			font-size: 1.25rem;
		}
		
		.rank {
			font-size: 1.25rem;
			width: 1.5rem;
		}
		
		.rank-number {
			width: 1.5rem;
			font-size: 0.8rem;
		}
	}
</style>

