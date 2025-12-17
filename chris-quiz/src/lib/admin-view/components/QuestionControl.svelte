<script lang="ts">
	/**
	 * Question Control Component - Admin View
	 * Zeigt aktuelle Frage MIT Antwort für den Moderator
	 */
	import { gameState } from '../stores/adminState';

	export let onReturnToMatrix: () => void = () => {};
	export let onRevealQuestion: () => void = () => {};

	$: question = $gameState.selectedQuestion;
	$: buzzerQueue = $gameState.buzzerQueue;
	$: currentView = $gameState.currentView;
	$: hasActiveBuzzers = buzzerQueue.length > 0;
	$: isWaitingForReveal = currentView === 'question-selected';
</script>

<div class="question-control">
	<div class="control-header">
		<i class="fas fa-question-circle header-icon"></i>
		<h2 class="control-title">Aktuelle Frage</h2>
		{#if isWaitingForReveal}
			<span class="status-badge status-waiting">
				<i class="fas fa-eye-slash"></i>
				Versteckt
			</span>
		{:else if hasActiveBuzzers}
			<span class="buzzer-badge">
				<i class="fas fa-bell"></i>
				{buzzerQueue.length}
			</span>
		{:else if question}
			<span class="status-badge status-active">
				<i class="fas fa-play"></i>
				Live
			</span>
		{/if}
	</div>

	{#if question}
		<div class="question-content">
			<div class="question-meta">
				<div class="meta-badge category-badge">
					<i class="fas fa-folder"></i>
					<span>{question.category}</span>
				</div>
				<div class="meta-badge points-badge">
					<i class="fas fa-star"></i>
					<span>{question.points} Pkt</span>
				</div>
			</div>

			<div class="question-box">
				<div class="box-label">
					<i class="fas fa-question"></i>
					Frage
				</div>
				<p class="question-text">{question.question}</p>
			</div>

			<div class="answer-box">
				<div class="box-label">
					<i class="fas fa-check"></i>
					Antwort
				</div>
				<p class="answer-text">{question.answer || 'Keine Antwort hinterlegt'}</p>
			</div>
		</div>

		<div class="control-actions">
			{#if isWaitingForReveal}
				<button class="btn-reveal" on:click={onRevealQuestion}>
					<i class="fas fa-eye"></i>
					<span>Frage aufdecken</span>
				</button>
				<button class="btn-cancel" on:click={onReturnToMatrix}>
					<i class="fas fa-times"></i>
					<span>Abbrechen</span>
				</button>
			{:else}
				<button class="btn-return" on:click={onReturnToMatrix}>
					<i class="fas fa-arrow-left"></i>
					<span>Zurück zur Matrix</span>
				</button>
			{/if}
		</div>
	{:else}
		<div class="no-question">
			<i class="fas fa-hand-pointer no-question-icon"></i>
			<p class="no-question-text">Keine Frage ausgewählt</p>
			<p class="no-question-hint">Wähle eine Zelle in der Matrix</p>
		</div>
	{/if}
</div>

<style>
	.question-control {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, rgba(18, 24, 30, 0.98) 0%, rgba(12, 18, 24, 0.99) 100%);
		border-radius: 10px;
		border: 1px solid rgba(212, 175, 55, 0.15);
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03);
		box-sizing: border-box;
	}

	.control-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%);
		border-bottom: 1px solid rgba(212, 175, 55, 0.12);
	}

	.header-icon {
		color: #d4af37;
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.control-title {
		font-family: 'Cinzel', serif;
		font-size: 0.7rem;
		font-weight: 600;
		color: #d4af37;
		margin: 0;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.buzzer-badge {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: rgba(180, 60, 60, 0.25);
		color: #e8a0a0;
		font-size: 0.6rem;
		font-weight: 700;
		padding: 0.15rem 0.45rem;
		border-radius: 10px;
		border: 1px solid rgba(180, 60, 60, 0.3);
		animation: pulse-badge 1.5s ease-in-out infinite;
	}

	.buzzer-badge i {
		font-size: 0.5rem;
	}

	@keyframes pulse-badge {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(1.05); }
	}

	.question-content {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		padding: 0.6rem;
	}

	.question-content::-webkit-scrollbar {
		width: 3px;
	}

	.question-content::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.question-content::-webkit-scrollbar-thumb {
		background: rgba(212, 175, 55, 0.25);
		border-radius: 2px;
	}

	.question-meta {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
		flex-wrap: wrap;
	}

	.meta-badge {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		font-size: 0.65rem;
		font-weight: 600;
	}

	.meta-badge i {
		font-size: 0.55rem;
		opacity: 0.7;
	}

	.category-badge {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #f5f0e1;
	}

	.points-badge {
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.25);
		color: #d4af37;
	}

	.question-box {
		margin-bottom: 0.5rem;
		padding: 0.6rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.box-label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.55rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.4);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 0.35rem;
	}

	.box-label i {
		font-size: 0.5rem;
	}

	.question-text {
		font-size: 0.85rem;
		line-height: 1.5;
		color: #f5f0e1;
		margin: 0;
	}

	.answer-box {
		padding: 0.6rem;
		background: linear-gradient(135deg, rgba(45, 90, 61, 0.2) 0%, rgba(45, 90, 61, 0.1) 100%);
		border-radius: 8px;
		border: 1px solid rgba(45, 90, 61, 0.4);
	}

	.answer-box .box-label {
		color: #a8d5a2;
	}

	.answer-text {
		font-size: 0.95rem;
		line-height: 1.4;
		color: #a8d5a2;
		margin: 0;
		font-weight: 600;
	}

	.control-actions {
		flex-shrink: 0;
		padding: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.04);
	}

	.btn-return {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		background: linear-gradient(135deg, #4a1a1a 0%, #6b2d2d 100%);
		border: 1px solid rgba(107, 45, 45, 0.5);
		border-radius: 6px;
		color: #e8a0a0;
		font-family: 'Lato', sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 38px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-return i {
		font-size: 0.7rem;
		transition: transform 0.2s ease;
	}

	.btn-return:hover {
		background: linear-gradient(135deg, #6b2d2d 0%, #8b3d3d 100%);
		border-color: rgba(139, 61, 61, 0.6);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(107, 45, 45, 0.3);
	}

	.btn-return:hover i {
		transform: translateX(-2px);
	}

	.btn-return:active {
		transform: translateY(0);
	}

	/* Reveal Button - Prominent Green */
	.btn-reveal {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #2d5a3d 0%, #3d7a4d 100%);
		border: 1px solid rgba(61, 122, 77, 0.6);
		border-radius: 6px;
		color: #a8d5a2;
		font-family: 'Lato', sans-serif;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 44px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		animation: pulse-reveal 2s ease-in-out infinite;
		margin-bottom: 0.5rem;
	}

	@keyframes pulse-reveal {
		0%, 100% { box-shadow: 0 4px 15px rgba(61, 122, 77, 0.3); }
		50% { box-shadow: 0 4px 25px rgba(61, 122, 77, 0.5); }
	}

	.btn-reveal i {
		font-size: 0.8rem;
	}

	.btn-reveal:hover {
		background: linear-gradient(135deg, #3d7a4d 0%, #4d9a5d 100%);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(61, 122, 77, 0.4);
	}

	.btn-reveal:active {
		transform: translateY(0);
	}

	/* Cancel Button - Subtle */
	.btn-cancel {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.5);
		font-family: 'Lato', sans-serif;
		font-size: 0.7rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 36px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-cancel i {
		font-size: 0.6rem;
	}

	.btn-cancel:hover {
		background: rgba(180, 60, 60, 0.15);
		border-color: rgba(180, 60, 60, 0.3);
		color: #e8a0a0;
	}

	/* Status Badges */
	.status-badge {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.55rem;
		font-weight: 700;
		padding: 0.15rem 0.45rem;
		border-radius: 10px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge i {
		font-size: 0.45rem;
	}

	.status-waiting {
		background: rgba(212, 175, 55, 0.2);
		border: 1px solid rgba(212, 175, 55, 0.3);
		color: #d4af37;
		animation: blink-waiting 1.5s ease-in-out infinite;
	}

	@keyframes blink-waiting {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.status-active {
		background: rgba(45, 90, 61, 0.25);
		border: 1px solid rgba(45, 90, 61, 0.4);
		color: #a8d5a2;
	}

	.no-question {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 1rem;
		color: rgba(255, 255, 255, 0.3);
	}

	.no-question-icon {
		font-size: 1.5rem;
		margin-bottom: 0.6rem;
		opacity: 0.4;
	}

	.no-question-text {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 0 0.25rem;
	}

	.no-question-hint {
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.3);
		margin: 0;
		font-style: italic;
	}
</style>
