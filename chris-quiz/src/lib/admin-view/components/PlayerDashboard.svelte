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

	function getRankClass(index: number): string {
		if (index === 0) return 'rank-gold';
		if (index === 1) return 'rank-silver';
		if (index === 2) return 'rank-bronze';
		return '';
	}
</script>

<div class="player-dashboard">
	<div class="dashboard-header">
		<i class="fas fa-users header-icon"></i>
		<h2 class="dashboard-title">Spieler</h2>
		<span class="player-count">{players.length}</span>
	</div>

	<div class="player-list">
		{#if players.length === 0}
			<div class="no-players">
				<i class="fas fa-user-clock no-players-icon"></i>
				<p>Warte auf Spieler...</p>
			</div>
		{:else}
			{#each players as player, index (player.id)}
				{@const isActive = player.id === activeId}
				<div class="player-card" class:active={isActive}>
					<div class="player-main">
						<span class="player-rank {getRankClass(index)}">
							{#if index < 3}
								<i class="fas fa-trophy"></i>
							{:else}
								{index + 1}
							{/if}
						</span>
						<div class="player-info">
							<span class="player-name">{player.name}</span>
							<span class="player-score">{player.score} Pkt</span>
						</div>
					</div>

					<div class="player-controls">
						{#if question}
							<button
								class="btn-score btn-add"
								on:click={() => updateScore(player.id, points)}
								title="Punkte geben"
							>
								<i class="fas fa-plus"></i>
								<span>{points}</span>
							</button>
							<button
								class="btn-score btn-subtract"
								on:click={() => updateScore(player.id, -points)}
								title="Punkte abziehen"
							>
								<i class="fas fa-minus"></i>
								<span>{points}</span>
							</button>
						{/if}
						<button
							class="btn-delete"
							on:click={() => deletePlayer(player.id)}
							title="Spieler entfernen"
						>
							<i class="fas fa-times"></i>
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.player-dashboard {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, rgba(18, 24, 30, 0.98) 0%, rgba(12, 18, 24, 0.99) 100%);
		border-radius: 10px;
		border: 1px solid rgba(212, 175, 55, 0.15);
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03);
		box-sizing: border-box;
	}

	.dashboard-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%);
		border-bottom: 1px solid rgba(212, 175, 55, 0.12);
	}

	.header-icon {
		color: #d4af37;
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.dashboard-title {
		font-family: 'Cinzel', serif;
		font-size: 0.7rem;
		font-weight: 600;
		color: #d4af37;
		margin: 0;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.player-count {
		margin-left: auto;
		background: rgba(212, 175, 55, 0.15);
		color: #d4af37;
		font-size: 0.6rem;
		font-weight: 700;
		padding: 0.15rem 0.45rem;
		border-radius: 10px;
		border: 1px solid rgba(212, 175, 55, 0.2);
	}

	.player-list {
		flex: 1;
		padding: 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		overflow-y: auto;
		min-height: 0;
	}

	.player-list::-webkit-scrollbar {
		width: 3px;
	}

	.player-list::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.player-list::-webkit-scrollbar-thumb {
		background: rgba(212, 175, 55, 0.25);
		border-radius: 2px;
	}

	.player-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.04);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		flex-shrink: 0;
	}

	.player-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.08);
	}

	.player-card.active {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
		border-color: rgba(212, 175, 55, 0.3);
		box-shadow: 0 0 12px rgba(212, 175, 55, 0.1);
	}

	.player-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.player-rank {
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.65rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		flex-shrink: 0;
	}

	.player-rank.rank-gold {
		background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
		color: #1a1408;
		box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
	}

	.player-rank.rank-silver {
		background: linear-gradient(135deg, #a8a8a8 0%, #8a8a8a 100%);
		color: #1a1a1a;
	}

	.player-rank.rank-bronze {
		background: linear-gradient(135deg, #cd7f32 0%, #a66628 100%);
		color: #1a1408;
	}

	.player-rank i {
		font-size: 0.6rem;
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.player-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: #f5f0e1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	.player-score {
		font-size: 0.6rem;
		color: rgba(212, 175, 55, 0.8);
		font-weight: 600;
		line-height: 1.2;
	}

	.player-controls {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	.btn-score {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid transparent;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.6rem;
		cursor: pointer;
		transition: all 0.15s ease;
		min-height: 26px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-score i {
		font-size: 0.55rem;
	}

	.btn-add {
		background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
		color: #a8d5a2;
		border-color: rgba(45, 90, 61, 0.4);
	}

	.btn-add:hover {
		background: linear-gradient(135deg, #2d5a3d 0%, #3d7a50 100%);
		transform: translateY(-1px);
	}

	.btn-subtract {
		background: linear-gradient(135deg, #4a1a1a 0%, #6b2d2d 100%);
		color: #e8a0a0;
		border-color: rgba(107, 45, 45, 0.4);
	}

	.btn-subtract:hover {
		background: linear-gradient(135deg, #6b2d2d 0%, #8b3d3d 100%);
		transform: translateY(-1px);
	}

	.btn-delete {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.3);
		font-size: 0.65rem;
		cursor: pointer;
		transition: all 0.15s ease;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-delete:hover {
		background: rgba(180, 60, 60, 0.2);
		border-color: rgba(180, 60, 60, 0.4);
		color: #e8a0a0;
	}

	.no-players {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
	}

	.no-players-icon {
		font-size: 1.2rem;
		margin-bottom: 0.4rem;
		opacity: 0.4;
	}

	.no-players p {
		margin: 0;
		font-size: 0.7rem;
		font-style: italic;
	}
</style>
