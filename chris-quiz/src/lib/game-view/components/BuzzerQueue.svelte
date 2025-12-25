<script lang="ts">
	/**
	 * Buzzer Queue Component - Elegant Sidebar Design
	 * Zeigt die Buzzer-Queue als elegantes Side-Panel
	 */
	import type { BuzzerEntry } from '$lib/shared';
	import { sortedBuzzerQueue } from '../stores/gameViewState';
	import { fly, scale } from 'svelte/transition';

	export let maxVisible: number = 5;

	$: visibleEntries = $sortedBuzzerQueue.slice(0, maxVisible);
	$: hasMore = $sortedBuzzerQueue.length > maxVisible;

	function formatReactionTime(ms: number): string {
		return (ms / 1000).toFixed(2) + 's';
	}

	function getPositionStyle(index: number): string {
		if (index === 0) return 'first';
		if (index === 1) return 'second';
		if (index === 2) return 'third';
		return 'other';
	}
</script>

{#if $sortedBuzzerQueue.length > 0}
	<aside class="buzzer-panel" transition:fly={{ x: 300, duration: 400 }}>
		<!-- Header -->
		<div class="buzzer-header">
			<div class="header-icon">🔔</div>
			<div class="header-text">
				<span class="header-title">BUZZER</span>
				<span class="header-count">{$sortedBuzzerQueue.length} Spieler</span>
			</div>
		</div>

		<!-- Buzzer List -->
		<div class="buzzer-list">
			{#each visibleEntries as entry, index (entry.playerId)}
				<div 
					class="buzzer-entry {getPositionStyle(index)}"
					transition:scale={{ duration: 300, delay: index * 50 }}
				>
					<!-- Position Badge -->
					<div class="position-badge">
						{#if index === 0}
							<span class="position-icon">🏆</span>
						{:else}
							<span class="position-number">{index + 1}</span>
						{/if}
					</div>

					<!-- Player Info -->
					<div class="player-info">
					<span class="player-name">{entry.playerName}</span>
						<span class="reaction-time">
							<span class="time-icon">⚡</span>
							{formatReactionTime(entry.reactionTime)}
						</span>
					</div>

					<!-- First Place Indicator -->
					{#if index === 0}
						<div class="first-indicator">
							<span class="pulse-ring"></span>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- More Indicator -->
		{#if hasMore}
			<div class="more-indicator">
				<span class="more-dots">•••</span>
				<span class="more-text">+{$sortedBuzzerQueue.length - maxVisible} weitere</span>
			</div>
		{/if}

		<!-- Decorative Elements -->
		<div class="decoration-top">❄️</div>
		<div class="decoration-bottom">🎄</div>
	</aside>
{/if}

<style>
	.buzzer-panel {
		position: fixed;
		right: 2rem;
		top: 50%;
		transform: translateY(-50%);
		width: 280px;
		background: linear-gradient(145deg, 
			rgba(15, 35, 50, 0.95) 0%,
			rgba(10, 25, 35, 0.98) 100%
		);
		border-radius: 20px;
		border: 2px solid rgba(220, 20, 60, 0.4);
		box-shadow: 
			0 10px 40px rgba(0, 0, 0, 0.5),
			0 0 60px rgba(220, 20, 60, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(20px);
		overflow: hidden;
		z-index: 50;
	}

	/* Header */
	.buzzer-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem 1.5rem;
		background: linear-gradient(135deg, 
			rgba(220, 20, 60, 0.2) 0%,
			rgba(139, 0, 0, 0.15) 100%
		);
		border-bottom: 1px solid rgba(220, 20, 60, 0.3);
	}

	.header-icon {
		font-size: 1.8rem;
		animation: ring 1s ease-in-out infinite;
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.header-title {
		font-family: 'Georgia', serif;
		font-size: 1.1rem;
		font-weight: bold;
		color: #fff8dc;
		letter-spacing: 0.15em;
	}

	.header-count {
		font-size: 0.75rem;
		color: rgba(255, 248, 220, 0.6);
	}

	/* Buzzer List */
	.buzzer-list {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.buzzer-entry {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		transition: all 0.3s ease;
	}

	.buzzer-entry.first {
		background: linear-gradient(135deg, 
			rgba(255, 215, 0, 0.15) 0%,
			rgba(212, 175, 55, 0.1) 100%
		);
		border-color: rgba(255, 215, 0, 0.5);
		box-shadow: 
			0 4px 20px rgba(255, 215, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.buzzer-entry.second {
		background: rgba(192, 192, 192, 0.08);
		border-color: rgba(192, 192, 192, 0.3);
	}

	.buzzer-entry.third {
		background: rgba(205, 127, 50, 0.08);
		border-color: rgba(205, 127, 50, 0.3);
	}

	/* Position Badge */
	.position-badge {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.buzzer-entry.first .position-badge {
		background: linear-gradient(135deg, #ffd700, #daa520);
		box-shadow: 0 2px 10px rgba(255, 215, 0, 0.4);
	}

	.position-icon {
		font-size: 1rem;
	}

	.position-number {
		font-size: 0.85rem;
		font-weight: bold;
		color: rgba(255, 248, 220, 0.7);
	}

	/* Player Info */
	.player-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.player-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: #fff8dc;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.buzzer-entry.first .player-name {
		color: #ffd700;
		text-shadow: 0 1px 4px rgba(255, 215, 0, 0.3);
	}

	.reaction-time {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
		color: rgba(255, 248, 220, 0.6);
		font-family: 'Courier New', monospace;
	}

	.time-icon {
		font-size: 0.7rem;
	}

	.buzzer-entry.first .reaction-time {
		color: rgba(255, 215, 0, 0.8);
	}

	/* First Place Pulse */
	.first-indicator {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
	}

	.pulse-ring {
		display: block;
		width: 10px;
		height: 10px;
		background: #ffd700;
		border-radius: 50%;
		animation: pulse-ring 1.5s ease-in-out infinite;
	}

	/* More Indicator */
	.more-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		color: rgba(255, 248, 220, 0.4);
		font-size: 0.8rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.more-dots {
		letter-spacing: 0.2em;
	}

	/* Decorative Elements */
	.decoration-top,
	.decoration-bottom {
		position: absolute;
		font-size: 1.2rem;
		opacity: 0.3;
	}

	.decoration-top {
		top: 0.75rem;
		right: 1rem;
	}

	.decoration-bottom {
		bottom: 0.5rem;
		left: 1rem;
	}

	/* Animations */
	@keyframes ring {
		0%, 100% { transform: rotate(0deg); }
		10% { transform: rotate(15deg); }
		20% { transform: rotate(-15deg); }
		30% { transform: rotate(10deg); }
		40% { transform: rotate(-10deg); }
		50%, 100% { transform: rotate(0deg); }
	}

	@keyframes pulse-ring {
		0% {
			box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
		}
	}

	/* Responsive */
	@media (max-width: 1400px) {
		.buzzer-panel {
			right: 1rem;
			width: 260px;
		}
	}

	@media (max-width: 1100px) {
		.buzzer-panel {
			width: 240px;
			right: 0.5rem;
		}

		.buzzer-header {
			padding: 1rem;
		}

		.buzzer-list {
			padding: 0.75rem;
		}
	}

	@media (max-width: 900px) {
		.buzzer-panel {
			top: auto;
			bottom: 1rem;
			left: 50%;
			right: auto;
			transform: translateX(-50%);
			width: calc(100% - 2rem);
			max-width: 400px;
		}

		.buzzer-list {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
		}

		.buzzer-entry {
			flex: 0 0 auto;
			min-width: 140px;
		}
	}
</style>
