<script lang="ts">
	/**
	 * Question Control Component - Admin View
	 * Zeigt aktuelle Frage MIT Antwort für den Moderator
	 */
	import { gameState } from '../stores/adminState';

	export let onReturnToMatrix: () => void = () => {};

	$: question = $gameState.selectedQuestion;
	$: buzzerQueue = $gameState.buzzerQueue;
	$: hasActiveBuzzers = buzzerQueue.length > 0;
</script>

<div class="question-control">
	<div class="control-header">
		<span class="header-icon">🎯</span>
		<h2 class="control-title">AKTUELLE FRAGE</h2>
	</div>

	{#if question}
		<!-- Question Meta -->
		<div class="question-meta">
			<div class="meta-badge category-badge">
				<span class="badge-icon">📂</span>
				<span class="badge-text">{question.category}</span>
			</div>
			<div class="meta-badge points-badge">
				<span class="badge-icon">⭐</span>
				<span class="badge-text">{question.points} Punkte</span>
			</div>
		</div>

		<!-- Question Text -->
		<div class="question-box">
			<div class="box-label">❓ FRAGE</div>
			<p class="question-text">{question.question}</p>
		</div>

		<!-- Answer (Visible to Admin!) -->
		<div class="answer-box">
			<div class="box-label">✅ ANTWORT</div>
			<p class="answer-text">{question.answer || 'Keine Antwort hinterlegt'}</p>
		</div>

		<!-- Buzzer Status -->
		{#if hasActiveBuzzers}
			<div class="buzzer-status">
				<span class="buzzer-icon">🔔</span>
				<span class="buzzer-count">{buzzerQueue.length} Spieler haben gebuzzt</span>
			</div>
		{/if}

		<!-- Control Button -->
		<div class="control-actions">
			<button class="btn-return" on:click={onReturnToMatrix}>
				<span class="btn-icon">↩️</span>
				<span class="btn-text">Zurück zur Matrix</span>
			</button>
		</div>
	{:else}
		<div class="no-question">
			<div class="no-question-icon">🎄</div>
			<p class="no-question-text">Keine Frage ausgewählt</p>
			<p class="no-question-hint">Klicke auf eine Zelle in der Matrix</p>
		</div>
	{/if}
</div>

<style>
	.question-control {
		background: linear-gradient(145deg, 
			rgba(20, 35, 50, 0.95) 0%,
			rgba(15, 28, 40, 0.98) 100%
		);
		border-radius: 16px;
		border: 1px solid rgba(212, 175, 55, 0.3);
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* Header */
	.control-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(212, 175, 55, 0.1);
		border-bottom: 1px solid rgba(212, 175, 55, 0.2);
	}

	.header-icon {
		font-size: 1.2rem;
	}

	.control-title {
		font-size: 0.9rem;
		font-weight: bold;
		color: #d4af37;
		margin: 0;
		letter-spacing: 0.1em;
	}

	/* Question Meta */
	.question-meta {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		flex-wrap: wrap;
	}

	.meta-badge {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
	}

	.category-badge {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.category-badge .badge-text {
		color: #fff8dc;
		font-weight: 600;
	}

	.points-badge {
		background: rgba(212, 175, 55, 0.15);
		border: 1px solid rgba(212, 175, 55, 0.4);
	}

	.points-badge .badge-text {
		color: #ffd700;
		font-weight: bold;
	}

	.badge-icon {
		font-size: 0.9rem;
	}

	/* Question Box */
	.question-box {
		margin: 0 1rem 0.75rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.box-label {
		font-size: 0.7rem;
		font-weight: bold;
		color: rgba(255, 248, 220, 0.5);
		letter-spacing: 0.1em;
		margin-bottom: 0.4rem;
	}

	.question-text {
		font-size: 0.95rem;
		line-height: 1.5;
		color: #fff8dc;
		margin: 0;
	}

	/* Answer Box - Highlighted for Admin */
	.answer-box {
		margin: 0 1rem 1rem;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, 
			rgba(34, 139, 34, 0.2) 0%,
			rgba(50, 205, 50, 0.1) 100%
		);
		border-radius: 10px;
		border: 2px solid rgba(50, 205, 50, 0.4);
		box-shadow: 0 0 15px rgba(50, 205, 50, 0.1);
	}

	.answer-box .box-label {
		color: #90EE90;
	}

	.answer-text {
		font-size: 1.1rem;
		line-height: 1.4;
		color: #90EE90;
		margin: 0;
		font-weight: bold;
	}

	/* Buzzer Status */
	.buzzer-status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 1rem 1rem;
		padding: 0.5rem;
		background: rgba(220, 20, 60, 0.15);
		border-radius: 8px;
		border: 1px solid rgba(220, 20, 60, 0.3);
	}

	.buzzer-icon {
		font-size: 1rem;
		animation: ring 1s ease-in-out infinite;
	}

	.buzzer-count {
		font-size: 0.85rem;
		color: #ff6b6b;
		font-weight: 600;
	}

	@keyframes ring {
		0%, 100% { transform: rotate(0deg); }
		10% { transform: rotate(10deg); }
		20% { transform: rotate(-10deg); }
		30% { transform: rotate(5deg); }
		40%, 100% { transform: rotate(0deg); }
	}

	/* Control Actions */
	.control-actions {
		padding: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.btn-return {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #dc143c 0%, #b01030 100%);
		border: none;
		border-radius: 10px;
		color: white;
		font-size: 0.9rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-return:hover {
		background: linear-gradient(135deg, #ff2050 0%, #dc143c 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
	}

	.btn-return:active {
		transform: translateY(0);
	}

	.btn-icon {
		font-size: 1.1rem;
	}

	/* No Question State */
	.no-question {
		padding: 2rem 1rem;
		text-align: center;
	}

	.no-question-icon {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
		opacity: 0.5;
	}

	.no-question-text {
		font-size: 1rem;
		color: rgba(255, 248, 220, 0.6);
		margin: 0 0 0.5rem;
	}

	.no-question-hint {
		font-size: 0.85rem;
		color: rgba(255, 248, 220, 0.4);
		margin: 0;
	}
</style>
