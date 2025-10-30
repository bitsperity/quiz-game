<script lang="ts">
	/**
	 * Question Component für Player View
	 * Zeigt die ausgewählte Frage an
	 * SOLID-Prinzip: Single Responsibility - Nur Frage-Anzeige
	 */
	import { fade } from 'svelte/transition';
	import type { Question } from '$lib/shared';
	
	export let question: Question | null = null;
</script>

{#if question}
	<div class="question-container" transition:fade>
		<div class="question-header">
			<div class="category-badge">
				🎄 {question.category} 🎄
			</div>
			<div class="points-badge">
				💰 {question.points} Punkte
			</div>
		</div>

		<div class="question-content">
			<div class="question-text">
				<div class="question-label">FRAGE:</div>
				<div class="question-text-content">{question.question}</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.question-container {
		width: 100%;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(255, 215, 0, 0.3);
		margin-bottom: 1rem;
	}

	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.category-badge {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
		border: 2px solid #ffd700;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		color: #ffd700;
		font-weight: bold;
		font-size: 0.9rem;
		text-align: center;
		flex: 1;
		min-width: 150px;
	}

	.points-badge {
		background: linear-gradient(135deg, rgba(34, 139, 34, 0.2), rgba(50, 205, 50, 0.2));
		border: 2px solid #228b22;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		color: #32cd32;
		font-weight: bold;
		font-size: 0.9rem;
		text-align: center;
		flex: 1;
		min-width: 150px;
	}

	.question-content {
		margin-top: 1rem;
	}

	.question-label {
		font-size: 0.9rem;
		color: rgba(255, 248, 220, 0.7);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.question-text-content {
		font-size: 1.25rem;
		color: #fff8dc;
		line-height: 1.6;
		font-weight: 500;
		text-align: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
	}

	/* Mobile Optimierungen */
	@media (max-width: 480px) {
		.question-container {
			padding: 0.75rem;
		}

		.question-header {
			flex-direction: column;
		}

		.category-badge,
		.points-badge {
			width: 100%;
		}

		.question-text-content {
			font-size: 1.1rem;
			padding: 0.75rem;
		}
	}
</style>

