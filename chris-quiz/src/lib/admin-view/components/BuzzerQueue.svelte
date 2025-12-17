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
	<div class="queue-header">
		<i class="fas fa-bell header-icon"></i>
		<h2 class="queue-title">Buzzer</h2>
		{#if buzzerQueue.length > 0}
			<span class="queue-count">{buzzerQueue.length}</span>
		{/if}
	</div>
	{#if buzzerQueue.length === 0}
		<div class="empty-queue">
			<i class="fas fa-hourglass-half empty-icon"></i>
			<p>Warte auf Buzzer...</p>
		</div>
	{:else}
		<div class="queue-list">
			{#each buzzerQueue as entry, index}
				{@const isActive = entry.playerId === activeId}
				<button
					class="queue-entry"
					class:active={isActive}
					class:first={index === 0}
					on:click={() => selectPlayer(entry.playerId)}
				>
					<span class="position">
						{#if index === 0}
							<i class="fas fa-hand-paper"></i>
						{:else}
							{index + 1}
						{/if}
					</span>
					<span class="player-name">{entry.playerName}</span>
					<span class="reaction-time">
						<i class="fas fa-stopwatch"></i>
						{formatReactionTime(entry.reactionTime)}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.buzzer-queue {
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

	.queue-header {
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

	.queue-title {
		font-family: 'Cinzel', serif;
		font-size: 0.7rem;
		font-weight: 600;
		color: #d4af37;
		margin: 0;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.queue-count {
		margin-left: auto;
		background: rgba(180, 60, 60, 0.25);
		color: #e8a0a0;
		font-size: 0.6rem;
		font-weight: 700;
		padding: 0.15rem 0.45rem;
		border-radius: 10px;
		border: 1px solid rgba(180, 60, 60, 0.3);
		animation: pulse-count 1.5s ease-in-out infinite;
	}

	@keyframes pulse-count {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(1.05); }
	}

	.queue-list {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.4rem;
		overflow-y: auto;
		min-height: 0;
	}

	.queue-list::-webkit-scrollbar {
		width: 3px;
	}

	.queue-list::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.queue-list::-webkit-scrollbar-thumb {
		background: rgba(212, 175, 55, 0.25);
		border-radius: 2px;
	}

	.queue-entry {
		display: grid;
		grid-template-columns: 1.6rem 1fr auto;
		gap: 0.5rem;
		align-items: center;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.04);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		min-height: 34px;
		flex-shrink: 0;
	}

	.queue-entry:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.08);
	}

	.queue-entry.first {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.06) 100%);
		border-color: rgba(212, 175, 55, 0.25);
	}

	.queue-entry.active {
		border-color: rgba(212, 175, 55, 0.5);
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%);
		box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
	}

	.position {
		width: 1.4rem;
		height: 1.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	.queue-entry.first .position {
		background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
		color: #1a1408;
	}

	.position i {
		font-size: 0.6rem;
	}

	.player-name {
		font-weight: 600;
		color: #f5f0e1;
		font-size: 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.reaction-time {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.4);
		font-family: 'Lato', monospace;
	}

	.reaction-time i {
		font-size: 0.5rem;
		opacity: 0.6;
	}

	.empty-queue {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
	}

	.empty-icon {
		font-size: 1.2rem;
		opacity: 0.4;
	}

	.empty-queue p {
		margin: 0;
		font-size: 0.7rem;
		font-style: italic;
	}
</style>

