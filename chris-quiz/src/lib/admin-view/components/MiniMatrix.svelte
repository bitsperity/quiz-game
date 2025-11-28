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
		<!-- Category Header Row -->
		<div class="matrix-header" style="--cols: {numCategories}">
			<div class="header-spacer"></div>
			{#each categories as category, idx}
				<div class="category-label" title={category}>
					{category}
				</div>
			{/each}
		</div>

		<!-- Matrix Rows -->
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
							<span class="cell-check">✓</span>
						{:else if cell?.state === 'selected'}
							<span class="cell-active">▶</span>
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
			<div class="empty-icon">🎄</div>
			<p>Keine Matrix-Daten</p>
			<p class="empty-hint">Fragen im Admin-Panel hinzufügen</p>
		</div>
	{/if}
</div>

<style>
	.mini-matrix {
		background: linear-gradient(145deg, 
			rgba(20, 35, 50, 0.95) 0%,
			rgba(15, 28, 40, 0.98) 100%
		);
		border-radius: 16px;
		border: 1px solid rgba(212, 175, 55, 0.3);
		padding: 1rem;
		overflow-x: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* Category Header */
	.matrix-header {
		display: grid;
		grid-template-columns: 3rem repeat(var(--cols), 1fr);
		gap: 0.4rem;
		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(212, 175, 55, 0.2);
	}

	.header-spacer {
		/* Empty space above point labels */
	}

	.category-label {
		font-size: 0.65rem;
		font-weight: bold;
		color: #d4af37;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.3rem 0.2rem;
		background: rgba(212, 175, 55, 0.1);
		border-radius: 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	/* Matrix Row */
	.matrix-row {
		display: grid;
		grid-template-columns: 3rem repeat(var(--cols), 1fr);
		gap: 0.4rem;
		margin-bottom: 0.4rem;
	}

	.point-label {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.8rem;
		color: #d4af37;
	}

	/* Matrix Cell */
	.matrix-cell {
		aspect-ratio: 1.2;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		touch-action: manipulation;
		border: 2px solid rgba(255, 255, 255, 0.1);
		background: linear-gradient(145deg, 
			rgba(30, 60, 80, 0.8) 0%,
			rgba(25, 50, 70, 0.9) 100%
		);
		color: #d4af37;
		min-height: 40px;
		font-size: 0.85rem;
	}

	.matrix-cell.available {
		border-color: rgba(212, 175, 55, 0.3);
	}

	.matrix-cell.available:hover:not(:disabled) {
		transform: scale(1.08);
		border-color: rgba(212, 175, 55, 0.8);
		box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
		background: linear-gradient(145deg, 
			rgba(40, 80, 100, 0.9) 0%,
			rgba(30, 60, 80, 0.95) 100%
		);
	}

	.matrix-cell.selected {
		border: 3px solid #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
		background: rgba(255, 215, 0, 0.2);
		animation: pulse-selected 1.5s ease-in-out infinite;
	}

	.matrix-cell.completed {
		background: rgba(50, 50, 60, 0.5);
		border-color: rgba(255, 255, 255, 0.05);
		cursor: not-allowed;
	}

	.matrix-cell:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	/* Cell Content */
	.cell-check {
		color: rgba(100, 200, 100, 0.6);
		font-size: 1.1rem;
	}

	.cell-active {
		color: #ffd700;
		font-size: 1rem;
		animation: blink 0.8s ease-in-out infinite;
	}

	.cell-points {
		font-size: 0.9rem;
	}

	.cell-empty {
		opacity: 0.3;
		font-size: 0.8rem;
	}

	/* Empty State */
	.empty-matrix {
		padding: 2rem;
		text-align: center;
	}

	.empty-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		opacity: 0.5;
	}

	.empty-matrix p {
		margin: 0;
		color: rgba(255, 248, 220, 0.5);
	}

	.empty-hint {
		font-size: 0.8rem;
		margin-top: 0.3rem !important;
		color: rgba(255, 248, 220, 0.3) !important;
	}

	/* Animations */
	@keyframes pulse-selected {
		0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
		50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive */
	@media (max-width: 600px) {
		.matrix-header,
		.matrix-row {
			grid-template-columns: 2.5rem repeat(var(--cols), 1fr);
			gap: 0.3rem;
		}

		.category-label {
			font-size: 0.55rem;
			padding: 0.2rem;
		}

		.matrix-cell {
			min-height: 35px;
			font-size: 0.75rem;
		}

		.point-label {
			font-size: 0.7rem;
		}
	}
</style>
