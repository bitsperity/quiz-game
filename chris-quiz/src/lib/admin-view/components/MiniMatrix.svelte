<script lang="ts">
	/**
	 * Mini Matrix Component für Admin View
	 * SOLID-Prinzip: Single Responsibility - Nur Matrix-Anzeige
	 * Agent 2 Bereich
	 */
	import type { MatrixCell } from '$lib/shared';
	import { selectedCell } from '../stores/adminState';

	export let matrix: MatrixCell[][] = [];
	export let onCellClick: (category: number, points: number) => void = () => {};

	$: currentSelected = $selectedCell;

	// Berechne Kategorien und Punktwerte aus Matrix
	$: matrixCategories = matrix.length > 0 && matrix[0]?.length > 0
		? matrix[0].map((_, idx) => idx)
		: [];
	$: matrixPointValues = matrix.length > 0
		? matrix.map((row) => row[0]?.pointValue).filter((val): val is number => val !== undefined)
		: [];
</script>

<div class="mini-matrix">
	{#if matrix.length > 0 && matrixCategories.length > 0 && matrixPointValues.length > 0}
		<!-- Header Row: Kategorien -->
		<div class="matrix-header"></div>
		{#each matrixPointValues as pointValue, rowIndex}
			<div class="matrix-row">
				<div class="point-label">{pointValue}</div>
				{#each matrixCategories as categoryIndex}
					{@const cell = matrix[rowIndex]?.[categoryIndex]}
					{@const isSelected = currentSelected?.category === categoryIndex && currentSelected?.points === pointValue}
					<button
						class="mini-matrix-cell"
						class:selected={isSelected}
						class:available={cell?.state === 'available'}
						class:completed={cell?.state === 'completed'}
						on:click={() => onCellClick(categoryIndex, pointValue)}
						disabled={cell?.state === 'completed' || !cell?.question}
					>
						{#if cell?.state === 'completed'}
							<span class="completed-mark">✓</span>
						{:else if cell?.question}
							<span class="points">{pointValue}</span>
						{:else}
							<span class="empty">—</span>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	{:else}
		<div class="empty-matrix">
			<p>Keine Matrix-Daten verfügbar</p>
		</div>
	{/if}
</div>

<style>
	.mini-matrix {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: rgba(15, 20, 25, 0.5);
		border-radius: 12px;
		max-width: 100%;
		overflow-x: auto;
	}

	.matrix-row {
		display: grid;
		grid-template-columns: 3rem repeat(5, 1fr);
		gap: 0.5rem;
		align-items: center;
	}

	@media (max-width: 768px) {
		.matrix-row {
			grid-template-columns: 2.5rem repeat(5, minmax(40px, 1fr));
		}
	}

	.point-label {
		font-weight: bold;
		font-size: 0.9rem;
		color: #ffd700;
		text-align: center;
	}

	.mini-matrix-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		font-size: clamp(0.75rem, 2vw, 1.25rem);
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		touch-action: manipulation;
		border: 2px solid rgba(255, 255, 255, 0.1);
		background: rgba(34, 139, 34, 0.2);
		color: #fff8dc;
		min-width: 50px;
		min-height: 50px;
	}

	.mini-matrix-cell:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
		border-color: rgba(255, 215, 0, 0.6);
	}

	.mini-matrix-cell.selected {
		border: 3px solid #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
		background: rgba(255, 215, 0, 0.2);
	}

	.mini-matrix-cell.completed {
		opacity: 0.5;
		cursor: not-allowed;
		background: rgba(128, 128, 128, 0.3);
	}

	.mini-matrix-cell:disabled {
		cursor: not-allowed;
		opacity: 0.3;
	}

	.completed-mark {
		font-size: 1.5rem;
		color: #ffd700;
	}

	.points {
		font-size: 1rem;
	}

	.empty {
		opacity: 0.3;
	}

	.empty-matrix {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 248, 220, 0.5);
	}
</style>

