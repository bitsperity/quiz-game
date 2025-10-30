<script lang="ts">
	/**
	 * Question Component für Game View
	 * Zeigt die ausgewählte Frage prominent an
	 * SOLID-Prinzip: Single Responsibility - Nur Frage-Anzeige
	 */
	import { fade } from 'svelte/transition';
	import type { Question } from '$lib/shared';
	import { sortedBuzzerQueue } from '../stores/gameViewState';
	import BuzzerQueue from './BuzzerQueue.svelte';

	export let question: Question | null = null;
	export let answer: string | null = null;
</script>

{#if question}
	<div class="question-container" transition:fade>
		<div class="question-header">
			<div class="category-badge">
				🎄 KATEGORIE: {question.category} 🎄
			</div>
			<div class="points-badge">
				💰 WERT: {question.points}
			</div>
		</div>

		<div class="question-content">
			<div class="question-text">
				<div class="question-label">FRAGE:</div>
				<div class="question-text-content">{question.question}</div>
			</div>
			
			{#if answer}
				<div class="answer-section" transition:fade>
					<div class="answer-label">✅ ANTWORT:</div>
					<div class="answer-text-content">{answer}</div>
				</div>
			{/if}
		</div>

		{#if $sortedBuzzerQueue.length > 0 && !answer}
			<BuzzerQueue entries={$sortedBuzzerQueue} maxVisible={5} />
		{/if}
	</div>
{/if}

<style>
	.question-container {
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		background: var(--color-dark-bg);
	}

	.question-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.category-badge {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: bold;
		color: var(--color-christmas-gold);
		text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
		padding: 1rem 2rem;
		background: rgba(255, 215, 0, 0.1);
		border: 2px solid var(--color-christmas-gold);
		border-radius: 12px;
	}

	.points-badge {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: bold;
		color: var(--color-christmas-green);
		padding: 0.75rem 1.5rem;
		background: rgba(34, 139, 34, 0.1);
		border: 2px solid var(--color-christmas-green);
		border-radius: 8px;
	}

	.question-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 1200px;
	}

	.question-text {
		width: 100%;
		text-align: center;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		border: 2px solid rgba(255, 255, 255, 0.1);
	}

	.question-label {
		font-size: clamp(1.5rem, 3vw, 2rem);
		color: var(--color-christmas-red);
		font-weight: bold;
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.question-text-content {
		font-size: clamp(2.5rem, 6vw, 5rem);
		font-weight: bold;
		color: var(--color-light-text);
		line-height: 1.3;
		word-wrap: break-word;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.answer-section {
		margin-top: 3rem;
		width: 100%;
		text-align: center;
		padding: 2rem;
		background: rgba(34, 139, 34, 0.2);
		border-radius: 16px;
		border: 3px solid var(--color-christmas-green);
		box-shadow: 0 0 30px rgba(34, 139, 34, 0.5);
	}

	.answer-label {
		font-size: clamp(1.5rem, 3vw, 2rem);
		color: var(--color-christmas-gold);
		font-weight: bold;
		margin-bottom: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.answer-text-content {
		font-size: clamp(2.5rem, 6vw, 5rem);
		font-weight: bold;
		color: var(--color-christmas-green);
		line-height: 1.3;
		word-wrap: break-word;
		font-family: 'Inter', system-ui, sans-serif;
		text-shadow: 0 0 20px rgba(34, 139, 34, 0.5);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1920px) {
		.question-container {
			padding: 2rem;
		}

		.question-text-content {
			font-size: clamp(2rem, 5vw, 4rem);
		}
	}
</style>

