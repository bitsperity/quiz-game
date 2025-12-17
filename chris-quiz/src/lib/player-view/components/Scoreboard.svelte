<script lang="ts">
	/**
	 * Scoreboard Component - iPhone optimiert
	 * Kompakt und weihnachtlich
	 */
	import type { Player } from '$lib/shared';
	
	export let players: Player[] = [];
	export let currentPlayerId: string | null = null;
	
	$: sortedPlayers = [...players].sort((a, b) => b.score - a.score);
	
	function getRankEmoji(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return '';
	}
</script>

<div class="scoreboard">
	<div class="scoreboard-header">
		<span class="header-icon">📊</span>
		<span class="header-title">Punktestand</span>
		<span class="player-count">{players.length}</span>
	</div>
	
	<div class="player-list">
		{#each sortedPlayers as player, index (player.id)}
			<div
				class="player-row"
				class:is-me={player.id === currentPlayerId}
				class:top-three={index < 3}
			>
				<div class="rank-area">
					{#if index < 3}
						<span class="rank-emoji">{getRankEmoji(index)}</span>
					{:else}
						<span class="rank-number">{index + 1}</span>
					{/if}
				</div>
				
				<div class="player-details">
					<span class="player-name">
						{player.name}
						{#if player.id === currentPlayerId}
							<span class="me-tag">Du</span>
						{/if}
					</span>
				</div>
				
				<div class="score-area">
					<span class="score-value">{player.score}</span>
				</div>
			</div>
		{/each}
		
		{#if sortedPlayers.length === 0}
			<div class="empty-state">
				<span class="empty-icon">🎄</span>
				<span class="empty-text">Warte auf Spieler...</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.scoreboard {
		background: rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	/* === HEADER === */
	.scoreboard-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		flex-shrink: 0;
	}

	.header-icon {
		font-size: 1rem;
	}

	.header-title {
		color: #fbbf24;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.player-count {
		margin-left: auto;
		background: rgba(251, 191, 36, 0.2);
		color: #fbbf24;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
	}

	/* === PLAYER LIST === */
	.player-list {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: 0.5rem;
	}

	/* Scrollbar styling */
	.player-list::-webkit-scrollbar {
		width: 4px;
	}

	.player-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.player-list::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}

	/* === PLAYER ROW === */
	.player-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		margin-bottom: 0.375rem;
		transition: all 0.2s ease;
	}

	.player-row:last-child {
		margin-bottom: 0;
	}

	.player-row.is-me {
		background: linear-gradient(135deg, 
			rgba(251, 191, 36, 0.15) 0%, 
			rgba(245, 158, 11, 0.1) 100%
		);
		border: 1px solid rgba(251, 191, 36, 0.3);
		box-shadow: 0 0 15px rgba(251, 191, 36, 0.15);
	}

	.player-row.top-three:not(.is-me) {
		background: rgba(255, 255, 255, 0.05);
	}

	/* === RANK === */
	.rank-area {
		width: 28px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rank-emoji {
		font-size: 1.125rem;
	}

	.rank-number {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.8rem;
		font-weight: 500;
	}

	/* === PLAYER DETAILS === */
	.player-details {
		flex: 1;
		min-width: 0;
	}

	.player-name {
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.player-row.is-me .player-name {
		color: #fbbf24;
		font-weight: 600;
	}

	.me-tag {
		background: rgba(251, 191, 36, 0.3);
		color: #fbbf24;
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.125rem 0.375rem;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		flex-shrink: 0;
	}

	/* === SCORE === */
	.score-area {
		flex-shrink: 0;
	}

	.score-value {
		color: #fbbf24;
		font-size: 1.125rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.player-row.is-me .score-value {
		text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
	}

	/* === EMPTY STATE === */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		gap: 0.5rem;
	}

	.empty-icon {
		font-size: 2rem;
		opacity: 0.5;
	}

	.empty-text {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.875rem;
	}

	/* === KLEINE BILDSCHIRME === */
	@media (max-height: 667px) {
		.scoreboard-header {
			padding: 0.5rem 0.75rem;
		}

		.player-list {
			padding: 0.375rem;
		}

		.player-row {
			padding: 0.5rem 0.625rem;
			margin-bottom: 0.25rem;
		}

		.player-name {
			font-size: 0.85rem;
		}

		.score-value {
			font-size: 1rem;
		}
	}
</style>
