<script lang="ts">
	/**
	 * Buzzer Queue Component
	 * Zeigt die Buzzer-Queue mit Reaktionszeiten
	 * SOLID-Prinzip: Single Responsibility - Nur Buzzer-Queue Anzeige
	 */
	import type { BuzzerEntry } from '$lib/shared';
	import { sortedBuzzerQueue } from '../stores/gameViewState';

	export let maxVisible: number = 5;

	$: visibleEntries = $sortedBuzzerQueue.slice(0, maxVisible);

	function formatReactionTime(ms: number): string {
		return (ms / 1000).toFixed(2) + 's';
	}
</script>

{#if $sortedBuzzerQueue.length > 0}
	<div class="buzzer-queue">
		<div class="buzzer-header">
			<span class="buzzer-icon">🔔</span>
			<h2>BUZZER-QUEUE</h2>
		</div>
		<div class="buzzer-list">
			{#each visibleEntries as entry, index}
				<div class="buzzer-entry" style="animation-delay: {index * 0.1}s" data-position={index}>
					<span class="position">{index + 1}.</span>
					<span class="player-name">{entry.playerName}</span>
					<span class="reaction-time">{formatReactionTime(entry.reactionTime)}</span>
				</div>
			{/each}
		</div>
		{#if $sortedBuzzerQueue.length > maxVisible}
			<div class="buzzer-more">
				+ {$sortedBuzzerQueue.length - maxVisible} weitere
			</div>
		{/if}
	</div>
{/if}

<style>
	.buzzer-queue {
		background: rgba(220, 20, 60, 0.1);
		border: 2px solid var(--color-christmas-red);
		border-radius: 12px;
		padding: 1.5rem;
		margin-top: 2rem;
		min-width: 400px;
		max-width: 600px;
	}

	.buzzer-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: bold;
		color: var(--color-christmas-gold);
	}

	.buzzer-icon {
		font-size: 1.5em;
	}

	.buzzer-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.buzzer-entry {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		font-size: clamp(1.2rem, 2.5vw, 1.8rem);
		animation: slideInRight 0.3s ease-out backwards;
		transition: all 0.2s ease;
	}

	.buzzer-entry[data-position='0'] {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
		border: 2px solid var(--color-christmas-gold);
		font-weight: bold;
		color: var(--color-christmas-gold);
	}

	.position {
		font-weight: bold;
		min-width: 2rem;
		color: var(--color-christmas-gold);
	}

	.player-name {
		flex: 1;
		color: var(--color-light-text);
	}

	.reaction-time {
		font-family: 'Courier New', monospace;
		color: var(--color-christmas-green);
		font-weight: bold;
	}

	.buzzer-more {
		margin-top: 0.5rem;
		text-align: center;
		color: var(--color-light-text);
		opacity: 0.7;
		font-size: clamp(1rem, 2vw, 1.5rem);
	}

	@keyframes slideInRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>

