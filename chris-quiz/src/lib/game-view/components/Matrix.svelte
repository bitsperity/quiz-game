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
	<div class="matrix-header">
		<h1 class="title">🎄 WEIHNACHTS-QUIZ 🎄</h1>
	</div>

	{#if matrix.length > 0 && categoryList.length > 0 && pointValueList.length > 0}
		<div class="matrix-grid" style="--categories: {categoryList.length}; --rows: {pointValueList.length};">
			<!-- Kategorien-Header -->
			{#each categoryList as categoryIndex}
				<div class="category-header">Kat {categoryIndex + 1}</div>
			{/each}

			<!-- Matrix-Zellen -->
			{#each pointValueList as pointValue}
				{#each categoryList as categoryIndex}
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
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: var(--color-dark-bg);
	}

	.matrix-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.title {
		font-size: clamp(3rem, 8vw, 6rem);
		font-weight: bold;
		color: var(--color-christmas-gold);
		text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
		margin: 0;
		font-family: 'Georgia', serif;
	}

	.matrix-grid {
		display: grid;
		grid-template-columns: repeat(var(--categories), 1fr);
		grid-template-rows: auto repeat(var(--rows), 1fr);
		gap: 1.5rem;
		max-width: 90vw;
		width: 100%;
	}

	.category-header {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: bold;
		color: var(--color-light-text);
		background: rgba(220, 20, 60, 0.2);
		border-radius: 8px;
		border: 2px solid var(--color-christmas-red);
	}

	.matrix-cell {
		aspect-ratio: 16/9;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		font-size: clamp(2rem, 5vw, 4rem);
		font-weight: bold;
		transition: all 0.3s ease;
		cursor: default;
		position: relative;
		min-height: 120px;
	}

	.matrix-cell.empty {
		background: rgba(42, 42, 42, 0.3);
		opacity: 0.3;
	}

	.matrix-cell.available {
		background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
		box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);
		color: var(--color-light-text);
	}

	.matrix-cell.selected {
		background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
		box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
		color: var(--color-dark-bg);
		animation: pulse 1s infinite;
	}

	.matrix-cell.completed {
		background: #2a2a2a;
		opacity: 0.5;
		color: var(--color-light-text);
		text-decoration: line-through;
	}

	.matrix-cell.completed .cell-value::before {
		content: '✓ ';
		color: var(--color-christmas-green);
	}

	.cell-value {
		text-align: center;
	}

	.matrix-empty {
		text-align: center;
		padding: 4rem;
		color: var(--color-light-text);
		font-size: clamp(1.5rem, 3vw, 2.5rem);
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	@media (max-width: 1920px) {
		.matrix-grid {
			gap: 1rem;
		}

		.matrix-cell {
			min-height: 100px;
		}
	}
</style>

