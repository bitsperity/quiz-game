<script lang="ts">
	/**
	 * Matrix Component für Game View
	 * Zeigt die Quiz-Matrix mit Kategorien und Punktewerten
	 * SOLID-Prinzip: Single Responsibility - Nur Matrix-Anzeige
	 */
	import type { MatrixCell } from '$lib/shared';
	import { categories, pointValues } from '../stores/gameViewState';

	export let matrix: MatrixCell[][] = [];

	$: categoryList = $categories;
	$: pointValueList = $pointValues;

	function getCell(categoryIndex: number, pointValue: number): MatrixCell | null {
		if (!matrix || matrix.length === 0) return null;
		const rowIndex = pointValueList.indexOf(pointValue);
		if (rowIndex === -1) return null;
		const row = matrix[rowIndex];
		if (!row) return null;
		return row.find((cell) => cell.categoryIndex === categoryIndex) || null;
	}

	function getCellClass(cell: MatrixCell | null): string {
		if (!cell) return 'matrix-cell empty';
		return `matrix-cell ${cell.state}`;
	}

	function getCellDisplayValue(cell: MatrixCell | null): string {
		if (!cell) return '';
		return cell.pointValue.toString();
	}
</script>

<div class="matrix-container">
	{#if matrix.length > 0 && categoryList.length > 0 && pointValueList.length > 0}
		<div class="matrix-grid" style="--categories: {categoryList.length}; --rows: {pointValueList.length};">
			<!-- Kategorien-Header -->
			{#each categoryList as category, i}
				<div class="category-header">{category}</div>
			{/each}

			<!-- Matrix-Zellen -->
			{#each pointValueList as pointValue}
				{#each categoryList as _, categoryIndex}
					{@const cell = getCell(categoryIndex, pointValue)}
					<div class={getCellClass(cell)} data-state={cell?.state || 'empty'}>
						<span class="cell-value">{getCellDisplayValue(cell)}</span>
					</div>
				{/each}
			{/each}
		</div>
	{:else}
		<div class="matrix-empty">
			<p>Keine Matrix-Daten verfügbar</p>
		</div>
	{/if}
</div>

<style>
	.matrix-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		/* Background is handled by layout */
		overflow: hidden;
		box-sizing: border-box;
	}

	.matrix-grid {
		display: grid;
		grid-template-columns: repeat(var(--categories), 1fr);
		grid-template-rows: auto repeat(var(--rows), minmax(0, 1fr));
		gap: 1rem;
		width: 100%;
		height: 100%;
		max-height: 100%;
		padding: 1rem;
		box-sizing: border-box;
		overflow: hidden;
		max-width: 1600px;
	}

	.category-header {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		font-family: var(--font-heading);
		font-size: clamp(1.2rem, 2vw, 1.8rem);
		font-weight: bold;
		color: var(--color-secondary);
		background: rgba(15, 32, 39, 0.8);
		border-radius: 12px;
		border: 1px solid var(--color-secondary);
		box-shadow: 0 4px 15px rgba(0,0,0,0.3);
		text-shadow: 0 2px 4px rgba(0,0,0,0.5);
		backdrop-filter: blur(5px);
	}

	.matrix-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		font-family: var(--font-heading);
		font-size: clamp(1.5rem, 2.5vw, 3rem);
		font-weight: bold;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		cursor: default;
		position: relative;
		min-height: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: 1px solid rgba(255,255,255,0.1);
	}

	.matrix-cell.empty {
		background: rgba(255, 255, 255, 0.05);
		border: 1px dashed rgba(255, 255, 255, 0.1);
	}

	.matrix-cell.available {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		box-shadow: 0 4px 15px rgba(0,0,0,0.3);
		color: var(--color-secondary);
		border: 1px solid rgba(212, 175, 55, 0.3);
	}
    
    /* Hover effect only implies it's active, but selection is done by admin */
    .matrix-cell.available:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
    }

	.matrix-cell.selected {
		background: linear-gradient(135deg, var(--color-secondary) 0%, #b8860b 100%);
		box-shadow: 0 0 30px rgba(212, 175, 55, 0.6);
		color: #000;
		transform: scale(1.05);
		z-index: 10;
		border: 2px solid #fff;
		animation: pulse 1.5s infinite;
	}

	.matrix-cell.completed {
		background: rgba(0, 0, 0, 0.4);
		opacity: 0.6;
		color: var(--color-text-muted);
		border: 1px solid rgba(255,255,255,0.05);
	}

	.matrix-cell.completed .cell-value {
        text-decoration: line-through;
        opacity: 0.5;
    }

	.cell-value {
		text-align: center;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.matrix-empty {
		text-align: center;
		padding: 4rem;
		color: var(--color-text);
		font-family: var(--font-heading);
		font-size: clamp(1.5rem, 3vw, 2.5rem);
	}

	@keyframes pulse {
		0%, 100% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.6); }
		50% { box-shadow: 0 0 50px rgba(212, 175, 55, 0.9); }
	}

	@media (max-width: 1920px) {
		.matrix-grid {
			gap: 0.75rem;
		}
	}
</style>

