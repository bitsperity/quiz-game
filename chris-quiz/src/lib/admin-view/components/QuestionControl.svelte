<script lang="ts">
	/**
	 * Question Control Component
	 * SOLID-Prinzip: Single Responsibility - Nur Frage-Kontrolle
	 * Agent 2 Bereich
	 */
	import { currentQuestion, answerRevealed, revealedAnswer } from '../stores/adminState';

	export let onReturnToMatrix: () => void = () => {};
	export let onRevealAnswer: () => void = () => {};

	$: question = $currentQuestion;
	$: isAnswerRevealed = $answerRevealed;
	$: answer = $revealedAnswer;
</script>

<div class="question-control">
	<h2 class="control-title">🎯 AKTUELLE FRAGE</h2>
	{#if question}
		<div class="question-info">
			<div class="question-meta">
				<span class="category">{question.category}</span>
				<span class="points">💰 {question.points}</span>
			</div>
			<div class="question-text">{question.question}</div>
			
			{#if isAnswerRevealed && answer}
				<div class="answer-section">
					<strong class="answer-label">✅ Antwort:</strong>
					<div class="answer-text">{answer}</div>
				</div>
			{/if}
		</div>

		<div class="control-buttons">
			{#if !isAnswerRevealed}
				<button class="btn-reveal" on:click={onRevealAnswer}>
					Antwort Revealen
				</button>
			{:else}
			<button class="btn-return" on:click={onReturnToMatrix}>
				Zurück zur Matrix
			</button>
			{/if}
		</div>
	{:else}
		<div class="no-question">
			<p>Keine Frage ausgewählt</p>
			<p class="hint">Klicke auf eine Zelle in der Matrix</p>
		</div>
	{/if}
</div>

<style>
	.question-control {
		padding: 1rem;
		background: rgba(15, 20, 25, 0.3);
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.control-title {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		color: #fff8dc;
		text-align: center;
	}

	.question-info {
		margin-bottom: 1rem;
	}

	.question-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(255, 215, 0, 0.3);
	}

	.category {
		font-weight: bold;
		font-size: 1.1rem;
		color: #fff8dc;
	}

	.points {
		font-size: 1.2rem;
		font-weight: bold;
		color: #ffd700;
	}

	.question-text {
		font-size: 1rem;
		line-height: 1.6;
		color: rgba(255, 248, 220, 0.9);
		margin-bottom: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.answer-section {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(34, 139, 34, 0.2);
		border-radius: 8px;
		border: 2px solid rgba(255, 215, 0, 0.3);
	}

	.answer-label {
		display: block;
		font-size: 1rem;
		color: #ffd700;
		margin-bottom: 0.5rem;
	}

	.answer-text {
		font-size: 1.1rem;
		line-height: 1.6;
		color: rgba(255, 248, 220, 0.95);
		font-weight: bold;
	}

	.control-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.control-buttons button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: bold;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
		touch-action: manipulation;
	}

	.btn-reveal {
		background: linear-gradient(135deg, #228b22, #32cd32);
		color: white;
	}

	.btn-reveal:hover {
		background: linear-gradient(135deg, #32cd32, #228b22);
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(34, 139, 34, 0.4);
	}

	.btn-return {
		background: linear-gradient(135deg, #dc143c, #ff6347);
		color: white;
	}

	.btn-return:hover {
		background: linear-gradient(135deg, #ff6347, #dc143c);
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(220, 20, 60, 0.4);
	}

	.no-question {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 248, 220, 0.5);
	}

	.hint {
		font-size: 0.9rem;
		margin-top: 0.5rem;
		color: rgba(255, 248, 220, 0.4);
	}
</style>

