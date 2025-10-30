<script lang="ts">
	/**
	 * Game Header Component
	 * SOLID-Prinzip: Single Responsibility - Nur Header-Layout
	 * Agent 1 Bereich
	 * 
	 * Layout:
	 * [Title] | [Kategorie] [Punkte] | [Top 3 Spieler horizontal]
	 */
	import { gameViewState, sortedPlayers } from '../stores/gameViewState';

	$: currentView = $gameViewState.currentView;
	$: selectedQuestion = $gameViewState.selectedQuestion;
	$: players = $sortedPlayers; // Verwende sortedPlayers für korrekte Sortierung nach Score
</script>

<header class="game-header">
	<!-- Linke Seite: Titel -->
	<div class="header-section header-left">
		<h1 class="title">🎄 WEIHNACHTS-QUIZ 🎄</h1>
	</div>

	<!-- Mitte: Aktuelle Frage -->
	{#if selectedQuestion}
		<div class="header-section header-center">
			<div class="question-badge">
				<span class="question-category">{selectedQuestion.category}</span>
				<span class="question-separator">•</span>
				<span class="question-points">💰 {selectedQuestion.points} Punkte</span>
			</div>
		</div>
	{/if}

	<!-- Rechte Seite: Top 3 Spieler -->
	<div class="header-section header-right">
		<div class="top-players">
			{#each players.slice(0, 3) as player, index (player.id)}
				<div class="top-player-card" style="--rank: {index}">
					<div class="player-rank-badge">
						{#if index === 0}
							🥇
						{:else if index === 1}
							🥈
						{:else}
							🥉
						{/if}
					</div>
					<div class="player-info">
						<div class="player-name">{player.name}</div>
						<div class="player-score">{player.score}</div>
					</div>
				</div>
			{/each}
			{#if players.length === 0}
				<div class="empty-message">
					Warte auf Spieler...
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.game-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, rgba(15, 20, 25, 0.95), rgba(26, 35, 50, 0.95));
		backdrop-filter: blur(10px);
		border-bottom: 2px solid rgba(255, 215, 0, 0.3);
		z-index: 100;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		gap: 1.5rem;
	}

	.header-section {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-left {
		flex: 0 0 auto;
		min-width: 250px;
	}

	.header-center {
		flex: 1 1 auto;
		min-width: 200px;
		justify-content: center;
	}

	.header-right {
		flex: 0 1 600px;
		max-width: 600px;
	}

	.title {
		font-size: clamp(1.2rem, 2.5vw, 2rem);
		font-weight: bold;
		color: var(--color-christmas-gold);
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.question-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 215, 0, 0.08);
		border: 1px solid rgba(255, 215, 0, 0.3);
		border-radius: 8px;
		backdrop-filter: blur(10px);
		font-size: clamp(0.85rem, 1.5vw, 1.1rem);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.question-category {
		color: var(--color-light-text);
		font-weight: bold;
		letter-spacing: 0.5px;
	}

	.question-separator {
		color: rgba(255, 215, 0, 0.5);
		font-weight: bold;
	}

	.question-points {
		color: var(--color-christmas-green);
		font-weight: bold;
	}

	/* Top Players Display */
	.top-players {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.top-player-card {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		transition: all 0.2s ease;
		border: 1px solid transparent;
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.top-player-card:nth-child(1) {
		background: rgba(255, 215, 0, 0.1);
		border-color: rgba(255, 215, 0, 0.3);
	}

	.top-player-card:nth-child(2) {
		background: rgba(192, 192, 192, 0.08);
		border-color: rgba(192, 192, 192, 0.2);
	}

	.top-player-card:nth-child(3) {
		background: rgba(184, 134, 11, 0.08);
		border-color: rgba(184, 134, 11, 0.2);
	}

	.top-player-card:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 215, 0, 0.5);
		transform: translateY(-2px);
	}

	.player-rank-badge {
		font-size: clamp(1.2rem, 2vw, 1.5rem);
		flex-shrink: 0;
		width: 1.8rem;
		text-align: center;
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
		flex: 1;
	}

	.player-name {
		color: var(--color-light-text);
		font-size: clamp(0.75rem, 1.2vw, 0.95rem);
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		letter-spacing: 0.3px;
	}

	.player-score {
		color: var(--color-christmas-gold);
		font-size: clamp(0.7rem, 1vw, 0.85rem);
		font-weight: bold;
		font-family: 'Courier New', monospace;
	}

	.empty-message {
		color: rgba(255, 248, 220, 0.5);
		font-size: 0.85rem;
		text-align: center;
		flex: 1;
		padding: 0.5rem;
		font-style: italic;
	}

	/* Responsive Design */
	@media (max-width: 1600px) {
		.game-header {
			gap: 1rem;
			height: 110px;
			padding: 0.5rem 1rem;
		}

		.header-left {
			min-width: 200px;
		}

		.header-right {
			max-width: 400px;
		}
	}

	@media (max-width: 1200px) {
		.game-header {
			flex-wrap: wrap;
			height: auto;
			padding: 0.75rem 1rem;
			gap: 0.75rem;
		}

		.header-left {
			min-width: 100%;
			order: 1;
		}

		.header-center {
			min-width: 100%;
			order: 2;
			flex: 0 1 100%;
		}

		.header-right {
			min-width: 100%;
			order: 3;
			flex: 0 1 100%;
			max-width: 100%;
		}
	}

	@media (max-width: 768px) {
		.top-players {
			gap: 0.5rem;
		}

		.top-player-card {
			padding: 0.4rem 0.5rem;
		}

		.player-rank-badge {
			font-size: 1rem;
		}
	}
</style>

