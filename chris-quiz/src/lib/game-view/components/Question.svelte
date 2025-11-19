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
		</div>

		{#if $sortedBuzzerQueue.length > 0}
			<BuzzerQueue maxVisible={5} />
		{/if}
	</div>
{/if}

<style>
	.question-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		/* Background handled by layout */
		overflow: hidden;
	}

	.question-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.category-badge {
		font-family: var(--font-heading);
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: bold;
		color: var(--color-secondary);
		text-shadow: 0 2px 10px rgba(0,0,0,0.5);
		padding: 1rem 3rem;
		background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
		border-top: 2px solid var(--color-secondary);
		border-bottom: 2px solid var(--color-secondary);
	}

	.points-badge {
		font-family: var(--font-heading);
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: bold;
		color: var(--color-text);
		padding: 0.75rem 2rem;
		background: var(--color-primary);
		border-radius: 50px;
		box-shadow: 0 4px 15px rgba(0,0,0,0.3);
		border: 2px solid rgba(255,255,255,0.1);
	}

	.question-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 1400px;
	}

	.question-text {
		width: 100%;
		text-align: center;
		padding: 4rem;
		background: rgba(15, 32, 39, 0.85);
		border-radius: 24px;
		border: 1px solid var(--color-secondary);
		box-shadow: 0 10px 40px rgba(0,0,0,0.5);
		backdrop-filter: blur(10px);
		position: relative;
	}
    
    .question-text::before {
        content: '❄';
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 40px;
        color: var(--color-secondary);
        background: var(--color-bg-middle);
        padding: 0 10px;
    }

	.question-label {
		font-family: var(--font-heading);
		font-size: clamp(1.5rem, 3vw, 2rem);
		color: var(--color-secondary);
		font-weight: bold;
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		opacity: 0.8;
	}

	.question-text-content {
		font-family: var(--font-heading);
		font-size: clamp(2.5rem, 5vw, 4.5rem);
		font-weight: bold;
		color: var(--color-text);
		line-height: 1.4;
		word-wrap: break-word;
		text-shadow: 0 2px 4px rgba(0,0,0,0.5);
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

	@media (max-width: 1920px) {
		.question-container {
			padding: 2rem;
		}

		.question-text-content {
			font-size: clamp(2rem, 5vw, 4rem);
		}
	}
</style>

