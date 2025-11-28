<script lang="ts">
	/**
	 * Player Dashboard Component - Admin View
	 * Spieler-Übersicht mit Score-Kontrolle
	 */
	import { sortedPlayers, activePlayerId, gameState } from '../stores/adminState';

	export let onScoreUpdate: (playerId: string, delta: number) => void = () => {};
	export let onDeletePlayer: (playerId: string) => void = () => {};

	$: players = $sortedPlayers;
	$: activeId = $activePlayerId;
	$: question = $gameState.selectedQuestion;
	$: points = question?.points || 0;

	function updateScore(playerId: string, delta: number) {
		onScoreUpdate(playerId, delta);
	}

	function deletePlayer(playerId: string) {
		if (confirm('Möchtest du diesen Spieler wirklich löschen?')) {
			onDeletePlayer(playerId);
		}
	}

	function getRankIcon(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return `${index + 1}.`;
	}
</script>

<div class="player-dashboard">
	<div class="dashboard-header">
		<span class="header-icon">👥</span>
		<h2 class="dashboard-title">SPIELER</h2>
		<span class="player-count">{players.length}</span>
	</div>

	<div class="player-list">
		{#if players.length === 0}
			<div class="no-players">
				<div class="no-players-icon">🎄</div>
				<p>Noch keine Spieler</p>
			</div>
		{:else}
			{#each players as player, index (player.id)}
				{@const isActive = player.id === activeId}
				<div class="player-card" class:active={isActive}>
					<!-- Rank & Info -->
					<div class="player-main">
						<span class="player-rank">{getRankIcon(index)}</span>
						<div class="player-info">
							<span class="player-name">{player.name}</span>
							<span class="player-score">{player.score} Punkte</span>
						</div>
					</div>

					<!-- Controls -->
					<div class="player-controls">
						{#if question}
							<button
								class="btn-score btn-add"
								on:click={() => updateScore(player.id, points)}
								title="Punkte geben"
							>
								<span class="btn-symbol">+</span>
								<span class="btn-value">{points}</span>
							</button>
							<button
								class="btn-score btn-subtract"
								on:click={() => updateScore(player.id, -points)}
								title="Punkte abziehen"
							>
								<span class="btn-symbol">−</span>
								<span class="btn-value">{points}</span>
							</button>
						{/if}
						<button
							class="btn-delete"
							on:click={() => deletePlayer(player.id)}
							title="Spieler entfernen"
						>
							✕
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.player-dashboard {
		background: linear-gradient(145deg, 
			rgba(20, 35, 50, 0.95) 0%,
			rgba(15, 28, 40, 0.98) 100%
		);
		border-radius: 16px;
		border: 1px solid rgba(212, 175, 55, 0.3);
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* Header */
	.dashboard-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(212, 175, 55, 0.1);
		border-bottom: 1px solid rgba(212, 175, 55, 0.2);
	}

	.header-icon {
		font-size: 1.2rem;
	}

	.dashboard-title {
		font-size: 0.9rem;
		font-weight: bold;
		color: #d4af37;
		margin: 0;
		letter-spacing: 0.1em;
	}

	.player-count {
		background: rgba(212, 175, 55, 0.2);
		color: #d4af37;
		font-size: 0.75rem;
		font-weight: bold;
		padding: 0.15rem 0.5rem;
		border-radius: 10px;
	}

	/* Player List */
	.player-list {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
	}

	/* Scrollbar */
	.player-list::-webkit-scrollbar {
		width: 6px;
	}

	.player-list::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
	}

	.player-list::-webkit-scrollbar-thumb {
		background: rgba(212, 175, 55, 0.3);
		border-radius: 3px;
	}

	/* Player Card */
	.player-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
	}

	.player-card:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	.player-card.active {
		background: rgba(255, 215, 0, 0.1);
		border-color: rgba(255, 215, 0, 0.4);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.15);
	}

	/* Player Main */
	.player-main {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex: 1;
		min-width: 0;
	}

	.player-rank {
		font-size: 1.1rem;
		width: 1.75rem;
		text-align: center;
		flex-shrink: 0;
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.player-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #fff8dc;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.player-score {
		font-size: 0.8rem;
		color: #d4af37;
		font-weight: bold;
	}

	/* Controls */
	.player-controls {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.btn-score {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.4rem 0.6rem;
		border: none;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.8rem;
	}

	.btn-symbol {
		font-size: 1rem;
		font-weight: bold;
	}

	.btn-value {
		font-size: 0.8rem;
	}

	.btn-add {
		background: linear-gradient(135deg, #228b22, #2a9d2a);
		color: white;
	}

	.btn-add:hover {
		background: linear-gradient(135deg, #2a9d2a, #32cd32);
		transform: scale(1.05);
	}

	.btn-subtract {
		background: linear-gradient(135deg, #c41e3a, #dc143c);
		color: white;
	}

	.btn-subtract:hover {
		background: linear-gradient(135deg, #dc143c, #ff4040);
		transform: scale(1.05);
	}

	.btn-delete {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: rgba(255, 248, 220, 0.5);
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-delete:hover {
		background: rgba(220, 20, 60, 0.3);
		border-color: rgba(220, 20, 60, 0.5);
		color: #ff6b6b;
	}

	/* No Players */
	.no-players {
		padding: 1.5rem;
		text-align: center;
		color: rgba(255, 248, 220, 0.4);
	}

	.no-players-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		opacity: 0.5;
	}

	.no-players p {
		margin: 0;
		font-size: 0.9rem;
	}
</style>
