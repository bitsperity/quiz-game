<script lang="ts">
	/**
	 * Buzzer Queue Component
	 * SOLID-Prinzip: Single Responsibility - Nur Buzzer-Queue Anzeige
	 * Agent 2 Bereich
	 */
	import type { BuzzerEntry } from '$lib/shared';
	import { gameState, activePlayerId } from '../stores/adminState';

	export let onSelectPlayer: (playerId: string) => void = () => {};

	$: buzzerQueue = $gameState.buzzerQueue;
	$: activeId = $activePlayerId;

	function formatReactionTime(ms: number): string {
		return `${(ms / 1000).toFixed(2)}s`;
	}

	function selectPlayer(playerId: string) {
		onSelectPlayer(playerId);
	}
</script>

<div class="buzzer-queue">
	<h2 class="queue-title">🔔 BUZZER-QUEUE</h2>
	{#if buzzerQueue.length === 0}
		<div class="empty-queue">
			<p>Keine Buzzer-Aktivität</p>
		</div>
	{:else}
		<div class="queue-list">
			{#each buzzerQueue as entry, index}
				{@const isActive = entry.playerId === activeId}
				<button
					class="queue-entry"
					class:active={isActive}
					on:click={() => selectPlayer(entry.playerId)}
				>
					<span class="position">{index + 1}.</span>
					<span class="player-name">{entry.playerName}</span>
					<span class="reaction-time">{formatReactionTime(entry.reactionTime)}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.buzzer-queue {
		padding: 1rem;
		background: rgba(15, 20, 25, 0.3);
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.queue-title {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		color: #fff8dc;
		text-align: center;
	}

	.queue-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.queue-entry {
		display: grid;
		grid-template-columns: 2rem 1fr auto;
		gap: 1rem;
		align-items: center;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		border: none;
		touch-action: manipulation;
		min-height: 44px;
	}

	.queue-entry:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateX(4px);
	}

	.queue-entry.active {
		border-color: #ffd700;
		background: rgba(255, 215, 0, 0.15);
		box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
	}

	.position {
		font-weight: bold;
		color: #ffd700;
		font-size: 1rem;
	}

	.player-name {
		font-weight: 500;
		color: #fff8dc;
		font-size: 1rem;
	}

	.reaction-time {
		font-size: 0.9rem;
		color: rgba(255, 248, 220, 0.7);
		font-family: monospace;
	}

	.empty-queue {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 248, 220, 0.5);
	}
</style>

