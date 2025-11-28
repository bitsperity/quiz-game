<script lang="ts">
	/**
	 * Matrix Component - Elegant Christmas Jeopardy Board
	 * Zeigt die Quiz-Matrix mit Kategorien und Punktewerten
	 */
	import type { MatrixCell } from '$lib/shared';
	import { categories, pointValues } from '../stores/gameViewState';
	import { fade, scale } from 'svelte/transition';

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
</script>

<div class="matrix-container" transition:fade={{ duration: 300 }}>
	{#if matrix.length > 0 && categoryList.length > 0 && pointValueList.length > 0}
		<div class="matrix-wrapper">
			<!-- Category Headers -->
			<div class="categories-row" style="--cols: {categoryList.length}">
				{#each categoryList as category, i}
					<div class="category-header" transition:scale={{ delay: i * 50 }}>
						<span class="category-icon">🎄</span>
						<span class="category-name">{category}</span>
					</div>
				{/each}
			</div>

			<!-- Points Grid -->
			<div class="points-grid" style="--cols: {categoryList.length}; --rows: {pointValueList.length}">
				{#each pointValueList as pointValue, rowIndex}
					{#each categoryList as _, categoryIndex}
						{@const cell = getCell(categoryIndex, pointValue)}
						<div 
							class={getCellClass(cell)} 
							data-state={cell?.state || 'empty'}
							transition:scale={{ delay: (rowIndex * categoryList.length + categoryIndex) * 30 }}
						>
							{#if cell?.state === 'available'}
								<span class="cell-value">{pointValue}</span>
								<span class="cell-sparkle">✨</span>
							{:else if cell?.state === 'completed'}
								<span class="cell-value completed">{pointValue}</span>
								<span class="cell-check">✓</span>
							{:else if cell?.state === 'selected'}
								<span class="cell-value">{pointValue}</span>
								<div class="cell-glow"></div>
							{/if}
						</div>
					{/each}
				{/each}
			</div>
		</div>

	{:else}
		<div class="matrix-empty">
			<span class="empty-icon">🎄</span>
			<p class="empty-text">Keine Quiz-Daten verfügbar</p>
			<p class="empty-hint">Bitte Fragen im Admin-Panel hinzufügen</p>
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
		justify-content: flex-start;
		padding: 1rem 3rem 2rem 3rem;
		overflow: hidden;
		box-sizing: border-box;
	}

	.matrix-wrapper {
		width: 100%;
		max-width: 1500px;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Category Headers */
	.categories-row {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.category-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.6rem 0.5rem;
		background: linear-gradient(180deg,
			rgba(20, 45, 65, 0.95) 0%,
			rgba(15, 35, 50, 0.9) 100%
		);
		border-radius: 12px;
		border: 2px solid rgba(212, 175, 55, 0.4);
		box-shadow: 
			0 4px 20px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
	}

	.category-icon {
		font-size: 1rem;
	}

	.category-name {
		font-family: 'Georgia', serif;
		font-size: clamp(0.75rem, 1.3vw, 1rem);
		font-weight: bold;
		color: #d4af37;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Points Grid */
	.points-grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		gap: 0.5rem;
		flex: 1;
		min-height: 0;
	}

	/* Matrix Cell */
	.matrix-cell {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		font-family: 'Georgia', serif;
		font-size: clamp(1.2rem, 2.2vw, 2rem);
		font-weight: bold;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		cursor: default;
		overflow: hidden;
		min-height: 0;
	}

	.matrix-cell.empty {
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed rgba(255, 255, 255, 0.1);
	}

	.matrix-cell.available {
		background: linear-gradient(145deg,
			rgba(25, 55, 75, 0.9) 0%,
			rgba(20, 45, 65, 0.95) 100%
		);
		border: 2px solid rgba(212, 175, 55, 0.3);
		box-shadow: 
			0 4px 15px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		color: #d4af37;
	}

	.matrix-cell.available:hover {
		transform: translateY(-4px) scale(1.02);
		border-color: rgba(212, 175, 55, 0.6);
		box-shadow: 
			0 8px 30px rgba(0, 0, 0, 0.4),
			0 0 30px rgba(212, 175, 55, 0.2);
	}

	.matrix-cell.selected {
		background: linear-gradient(145deg,
			rgba(212, 175, 55, 0.3) 0%,
			rgba(255, 215, 0, 0.2) 100%
		);
		border: 2px solid #ffd700;
		box-shadow: 
			0 0 40px rgba(255, 215, 0, 0.4),
			inset 0 0 20px rgba(255, 215, 0, 0.1);
		color: #ffd700;
		transform: scale(1.05);
		z-index: 10;
		animation: pulse-selected 2s ease-in-out infinite;
	}

	.matrix-cell.completed {
		background: rgba(15, 30, 45, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: rgba(255, 248, 220, 0.3);
	}

	.cell-value {
		position: relative;
		z-index: 2;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	.cell-value.completed {
		text-decoration: line-through;
		opacity: 0.4;
	}

	.cell-sparkle {
		position: absolute;
		top: 8px;
		right: 8px;
		font-size: 0.8rem;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.matrix-cell.available:hover .cell-sparkle {
		opacity: 1;
	}

	.cell-check {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 2.5rem;
		color: rgba(50, 205, 50, 0.3);
		font-weight: bold;
	}

	.cell-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
		animation: glow-pulse 2s ease-in-out infinite;
	}

	/* Empty State */
	.matrix-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem;
		background: rgba(15, 35, 50, 0.8);
		border-radius: 24px;
		border: 2px solid rgba(212, 175, 55, 0.2);
	}

	.empty-icon {
		font-size: 4rem;
		opacity: 0.5;
	}

	.empty-text {
		font-family: 'Georgia', serif;
		font-size: 1.5rem;
		color: #fff8dc;
		margin: 0;
	}

	.empty-hint {
		font-size: 1rem;
		color: rgba(255, 248, 220, 0.5);
		margin: 0;
	}

	/* Animations */
	@keyframes pulse-selected {
		0%, 100% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.1); }
		50% { box-shadow: 0 0 60px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.15); }
	}

	@keyframes glow-pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	/* Responsive */
	@media (max-width: 1400px) {
		.matrix-container {
			padding: 1rem 1.5rem;
		}

		.categories-row,
		.points-grid {
			gap: 0.5rem;
		}

		.category-header {
			padding: 0.75rem 0.5rem;
		}
	}

	@media (max-width: 1100px) {
		.matrix-cell {
			min-height: 60px;
			font-size: clamp(1.1rem, 2vw, 1.8rem);
		}

		.category-icon {
			display: none;
		}

		.category-name {
			font-size: clamp(0.7rem, 1.2vw, 0.9rem);
		}
	}

	@media (max-width: 768px) {
		.matrix-container {
			padding: 0.5rem;
		}

		.categories-row,
		.points-grid {
			gap: 0.3rem;
		}

		.matrix-cell {
			border-radius: 8px;
		}
	}
</style>
