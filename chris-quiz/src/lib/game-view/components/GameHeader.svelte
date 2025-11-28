<script lang="ts">
	/**
	 * Game Header Component - Elegant Christmas Design
	 * Kompaktes, professionelles Header mit Scoreboard
	 */
	import { gameViewState, sortedPlayers } from '../stores/gameViewState';

	$: currentView = $gameViewState.currentView;
	$: selectedQuestion = $gameViewState.selectedQuestion;
	$: players = $sortedPlayers;

	function getRankEmoji(index: number): string {
		const emojis = ['🥇', '🥈', '🥉'];
		return emojis[index] || `${index + 1}.`;
	}
</script>

<header class="game-header">
	<!-- Logo/Title -->
	<div class="header-logo">
		<span class="logo-icon">🎄</span>
		<div class="logo-text">
			<span class="logo-main">WEIHNACHTS</span>
			<span class="logo-sub">QUIZ</span>
		</div>
		<span class="logo-icon">🎄</span>
	</div>

	<!-- Current Question Info (wenn Frage ausgewählt) -->
	{#if selectedQuestion}
		<div class="current-question-info">
			<div class="question-category-pill">
				<span class="category-icon">📂</span>
				<span class="category-name">{selectedQuestion.category}</span>
			</div>
			<div class="question-points-pill">
				<span class="points-icon">⭐</span>
				<span class="points-value">{selectedQuestion.points}</span>
			</div>
		</div>
	{/if}

	<!-- Scoreboard - Top Players -->
	<div class="scoreboard-section">
		{#if players.length > 0}
			<div class="scoreboard-players">
				{#each players.slice(0, 5) as player, index (player.id)}
					<div class="player-chip" class:gold={index === 0} class:silver={index === 1} class:bronze={index === 2}>
						<span class="player-rank">{getRankEmoji(index)}</span>
						<span class="player-name">{player.name}</span>
						<span class="player-score">{player.score}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="waiting-players">
				<span class="waiting-icon">👥</span>
				<span class="waiting-text">Warte auf Spieler...</span>
			</div>
		{/if}
	</div>
</header>

<style>
	.game-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 2rem;
		background: linear-gradient(180deg, 
			rgba(10, 20, 28, 0.98) 0%, 
			rgba(15, 35, 45, 0.95) 100%
		);
		backdrop-filter: blur(20px);
		border-bottom: 2px solid;
		border-image: linear-gradient(90deg, 
			transparent, 
			rgba(212, 175, 55, 0.6), 
			rgba(255, 215, 0, 0.8), 
			rgba(212, 175, 55, 0.6), 
			transparent
		) 1;
		z-index: 100;
		box-shadow: 
			0 4px 30px rgba(0, 0, 0, 0.5),
			0 0 60px rgba(212, 175, 55, 0.1);
	}

	/* Logo Section */
	.header-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.logo-icon {
		font-size: 2rem;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
		animation: gentle-glow 3s ease-in-out infinite;
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		line-height: 1;
	}

	.logo-main {
		font-family: 'Georgia', serif;
		font-size: 1.1rem;
		font-weight: bold;
		color: #d4af37;
		letter-spacing: 0.15em;
		text-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
	}

	.logo-sub {
		font-family: 'Georgia', serif;
		font-size: 1.4rem;
		font-weight: bold;
		color: #fff8dc;
		letter-spacing: 0.3em;
		text-shadow: 0 2px 8px rgba(255, 248, 220, 0.3);
	}

	/* Current Question Info */
	.current-question-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem 1.5rem;
		background: rgba(212, 175, 55, 0.08);
		border-radius: 50px;
		border: 1px solid rgba(212, 175, 55, 0.3);
	}

	.question-category-pill,
	.question-points-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
	}

	.category-icon,
	.points-icon {
		font-size: 1.1rem;
	}

	.category-name {
		color: #fff8dc;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.points-value {
		color: #d4af37;
		font-weight: bold;
		font-family: 'Georgia', serif;
	}

	/* Scoreboard Section */
	.scoreboard-section {
		display: flex;
		align-items: center;
	}

	.scoreboard-players {
		display: flex;
		gap: 0.5rem;
	}

	.player-chip {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 25px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
		min-width: 100px;
	}

	.player-chip.gold {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(212, 175, 55, 0.1));
		border-color: rgba(255, 215, 0, 0.5);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
	}

	.player-chip.silver {
		background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(169, 169, 169, 0.08));
		border-color: rgba(192, 192, 192, 0.4);
	}

	.player-chip.bronze {
		background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(184, 115, 51, 0.08));
		border-color: rgba(205, 127, 50, 0.4);
	}

	.player-rank {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.player-name {
		color: #fff8dc;
		font-size: 0.85rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 80px;
	}

	.player-score {
		color: #d4af37;
		font-size: 0.9rem;
		font-weight: bold;
		font-family: 'Courier New', monospace;
		margin-left: auto;
	}

	.waiting-players {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 248, 220, 0.5);
		font-size: 0.9rem;
		font-style: italic;
	}

	.waiting-icon {
		font-size: 1.2rem;
		opacity: 0.6;
	}

	@keyframes gentle-glow {
		0%, 100% { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) brightness(1); }
		50% { filter: drop-shadow(0 2px 8px rgba(255,215,0,0.3)) brightness(1.1); }
	}

	/* Responsive */
	@media (max-width: 1400px) {
		.game-header {
			padding: 0 1.5rem;
		}
		
		.player-chip {
			min-width: 90px;
		}
		
		.player-name {
			max-width: 60px;
		}
	}

	@media (max-width: 1100px) {
		.game-header {
			height: 70px;
			padding: 0 1rem;
		}

		.logo-icon {
			font-size: 1.5rem;
		}

		.logo-main {
			font-size: 0.9rem;
		}

		.logo-sub {
			font-size: 1.1rem;
		}

		.current-question-info {
			padding: 0.4rem 1rem;
		}

		.player-chip {
			padding: 0.3rem 0.5rem;
			min-width: 80px;
		}
	}

	@media (max-width: 900px) {
		.current-question-info {
			display: none;
		}

		.scoreboard-players {
			gap: 0.3rem;
		}

		.player-chip {
			min-width: 70px;
			padding: 0.25rem 0.4rem;
		}

		.player-name {
			max-width: 50px;
			font-size: 0.8rem;
		}
	}
</style>
