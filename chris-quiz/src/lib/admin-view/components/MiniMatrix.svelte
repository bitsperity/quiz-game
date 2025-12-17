<script lang="ts">
	/**
	 * Mini Matrix Component für Admin View
	 * Zeigt Matrix MIT Kategorien für den Moderator
	 */
	import type { MatrixCell } from '$lib/shared';
	import { selectedCell, gameState } from '../stores/adminState';

	export let matrix: MatrixCell[][] = [];
	export let onCellClick: (category: number, points: number) => void = () => {};

	$: currentSelected = $selectedCell;
	$: categories = $gameState.questionMatrix.length > 0 && $gameState.questionMatrix[0]
		? $gameState.questionMatrix[0].map(cell => cell.question?.category || `Kat ${cell.categoryIndex + 1}`)
		: [];

	// Berechne Punktwerte aus Matrix
	$: matrixPointValues = matrix.length > 0
		? matrix.map((row) => row[0]?.pointValue).filter((val): val is number => val !== undefined)
		: [];

	// Anzahl Kategorien
	$: numCategories = matrix.length > 0 && matrix[0] ? matrix[0].length : 0;
</script>

<div class="mini-matrix">
	{#if matrix.length > 0 && numCategories > 0 && matrixPointValues.length > 0}
		<div class="matrix-header" style="--cols: {numCategories}">
			<div class="header-spacer"></div>
			{#each categories as category, idx}
				<div class="category-label" title={category}>
					{category}
				</div>
			{/each}
		</div>

		{#each matrixPointValues as pointValue, rowIndex}
			<div class="matrix-row" style="--cols: {numCategories}">
				<div class="point-label">{pointValue}</div>
				{#each Array(numCategories) as _, categoryIndex}
					{@const cell = matrix[rowIndex]?.[categoryIndex]}
					{@const isSelected = currentSelected?.category === categoryIndex && currentSelected?.points === pointValue}
					<button
						class="matrix-cell"
						class:selected={isSelected}
						class:available={cell?.state === 'available'}
						class:completed={cell?.state === 'completed'}
						on:click={() => onCellClick(categoryIndex, pointValue)}
						disabled={cell?.state === 'completed' || !cell?.question}
						title="{categories[categoryIndex]} - {pointValue}"
					>
						{#if cell?.state === 'completed'}
							<i class="fas fa-check cell-icon"></i>
						{:else if cell?.state === 'selected'}
							<i class="fas fa-play cell-icon active"></i>
						{:else if cell?.question}
							<span class="cell-points">{pointValue}</span>
						{:else}
							<span class="cell-empty">—</span>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	{:else}
		<div class="empty-matrix">
			<i class="fas fa-th empty-icon"></i>
			<p>Keine Matrix-Daten</p>
			<p class="empty-hint">Fragen im Admin-Panel hinzufügen</p>
		</div>
	{/if}
</div>

<style>
	.mini-matrix {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, rgba(18, 24, 30, 0.98) 0%, rgba(12, 18, 24, 0.99) 100%);
		border-radius: 10px;
		border: 1px solid rgba(212, 175, 55, 0.15);
		padding: 0.6rem;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03);
		box-sizing: border-box;
	}

	.matrix-header {
		flex-shrink: 0;
		display: grid;
		grid-template-columns: 2.2rem repeat(var(--cols), 1fr);
		gap: 0.35rem;
		margin-bottom: 0.4rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid rgba(212, 175, 55, 0.12);
	}

	.header-spacer {
		/* Empty space above point labels */
	}

	.category-label {
		font-family: 'Cinzel', serif;
		font-size: 0.55rem;
		font-weight: 600;
		color: #d4af37;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		padding: 0.25rem 0.2rem;
		background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
		border: 1px solid rgba(212, 175, 55, 0.15);
		border-radius: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.matrix-row {
		flex: 1;
		display: grid;
		grid-template-columns: 2.2rem repeat(var(--cols), 1fr);
		gap: 0.35rem;
		margin-bottom: 0.35rem;
		min-height: 0;
	}

	.matrix-row:last-child {
		margin-bottom: 0;
	}

	.point-label {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.7rem;
		color: rgba(212, 175, 55, 0.8);
	}

	.matrix-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		border: 1px solid rgba(212, 175, 55, 0.2);
		background: linear-gradient(180deg, rgba(30, 50, 65, 0.9) 0%, rgba(20, 35, 45, 0.95) 100%);
		color: #d4af37;
		min-height: 44px;
		font-size: 0.75rem;
	}

	.matrix-cell.available {
		border-color: rgba(212, 175, 55, 0.25);
	}

	.matrix-cell.available:hover:not(:disabled) {
		transform: translateY(-2px);
		border-color: rgba(212, 175, 55, 0.6);
		box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
		background: linear-gradient(180deg, rgba(40, 65, 85, 0.95) 0%, rgba(30, 50, 65, 1) 100%);
	}

	.matrix-cell.selected {
		border: 2px solid rgba(212, 175, 55, 0.8);
		box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%);
		animation: pulse-selected 2s ease-in-out infinite;
	}

	.matrix-cell.completed {
		background: rgba(30, 35, 40, 0.6);
		border-color: rgba(255, 255, 255, 0.03);
		cursor: not-allowed;
	}

	.matrix-cell:disabled {
		cursor: not-allowed;
		opacity: 0.35;
	}

	.cell-icon {
		font-size: 0.75rem;
	}

	.cell-icon.active {
		color: #d4af37;
		animation: blink 1s ease-in-out infinite;
	}

	.matrix-cell.completed .cell-icon {
		color: rgba(168, 213, 162, 0.5);
	}

	.cell-points {
		font-size: 0.8rem;
	}

	.cell-empty {
		opacity: 0.2;
		font-size: 0.7rem;
	}

	.empty-matrix {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
	}

	.empty-icon {
		font-size: 1.8rem;
		margin-bottom: 0.6rem;
		opacity: 0.4;
	}

	.empty-matrix p {
		margin: 0;
		font-size: 0.8rem;
	}

	.empty-hint {
		font-size: 0.7rem;
		margin-top: 0.3rem !important;
		color: rgba(255, 255, 255, 0.2) !important;
		font-style: italic;
	}

	@keyframes pulse-selected {
		0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
		50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.5); }
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	@media (orientation: portrait) and (max-width: 900px) {
		.matrix-header,
		.matrix-row {
			grid-template-columns: 2rem repeat(var(--cols), 1fr);
			gap: 0.25rem;
		}

		.category-label {
			font-size: 0.45rem;
			padding: 0.15rem;
		}

		.matrix-cell {
			min-height: 40px;
			font-size: 0.65rem;
		}

		.point-label {
			font-size: 0.6rem;
		}
	}
</style>
