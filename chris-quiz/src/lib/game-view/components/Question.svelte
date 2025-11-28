<script lang="ts">
	/**
	 * Question Component - Elegant Christmas Design
	 * Zeigt die ausgewählte Frage prominent und festlich an
	 */
	import { fade, scale } from 'svelte/transition';
	import type { Question } from '$lib/shared';
	import { sortedBuzzerQueue } from '../stores/gameViewState';
	import BuzzerQueue from './BuzzerQueue.svelte';

	export let question: Question | null = null;
</script>

{#if question}
	<div class="question-view" transition:fade={{ duration: 300 }}>
		<!-- Decorative Background Elements -->
		<div class="bg-decoration">
			<span class="snowflake s1">❄️</span>
			<span class="snowflake s2">❄️</span>
			<span class="snowflake s3">✨</span>
			<span class="snowflake s4">❄️</span>
			<span class="snowflake s5">⭐</span>
		</div>

		<!-- Main Question Card -->
		<div class="question-card" transition:scale={{ duration: 400, delay: 100 }}>
			<!-- Top Decoration -->
			<div class="card-top-decoration">
				<span class="deco-star">⭐</span>
				<div class="deco-line"></div>
				<span class="deco-icon">🎄</span>
				<div class="deco-line"></div>
				<span class="deco-star">⭐</span>
			</div>

			<!-- Category & Points Badge -->
			<div class="question-meta">
				<div class="category-badge">
					<span class="badge-icon">📚</span>
					<span class="badge-text">{question.category}</span>
				</div>
				<div class="points-badge">
					<span class="points-value">{question.points}</span>
					<span class="points-label">PUNKTE</span>
				</div>
			</div>

			<!-- Question Content -->
			<div class="question-content">
				<div class="question-label">
					<span class="label-icon">❓</span>
					<span class="label-text">FRAGE</span>
				</div>
				<p class="question-text">{question.question}</p>
			</div>

			<!-- Bottom Decoration -->
			<div class="card-bottom-decoration">
				<span class="holly">🎄</span>
				<span class="holly">❄️</span>
				<span class="holly">🎄</span>
			</div>
		</div>

		<!-- Buzzer Queue (Side Panel) -->
		<BuzzerQueue maxVisible={5} />
	</div>
{/if}

<style>
	.question-view {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	/* Background Decorations */
	.bg-decoration {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.snowflake {
		position: absolute;
		font-size: 2rem;
		opacity: 0.15;
		animation: float 15s ease-in-out infinite;
	}

	.s1 { top: 10%; left: 10%; animation-delay: 0s; }
	.s2 { top: 20%; right: 15%; animation-delay: -3s; font-size: 1.5rem; }
	.s3 { bottom: 30%; left: 5%; animation-delay: -6s; font-size: 2.5rem; }
	.s4 { bottom: 15%; right: 10%; animation-delay: -9s; }
	.s5 { top: 40%; left: 20%; animation-delay: -12s; font-size: 1.8rem; }

	@keyframes float {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		25% { transform: translateY(-20px) rotate(5deg); }
		50% { transform: translateY(-10px) rotate(-5deg); }
		75% { transform: translateY(-25px) rotate(3deg); }
	}

	/* Main Question Card */
	.question-card {
		max-width: 900px;
		width: 100%;
		background: linear-gradient(165deg,
			rgba(20, 45, 60, 0.95) 0%,
			rgba(15, 35, 48, 0.98) 50%,
			rgba(10, 28, 40, 0.98) 100%
		);
		border-radius: 24px;
		border: 2px solid rgba(212, 175, 55, 0.4);
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.5),
			0 0 100px rgba(212, 175, 55, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(20px);
		padding: 2.5rem;
		position: relative;
		overflow: hidden;
	}

	/* Glowing border effect */
	.question-card::before {
		content: '';
		position: absolute;
		inset: -2px;
		background: linear-gradient(135deg, 
			rgba(212, 175, 55, 0.5),
			rgba(255, 215, 0, 0.3),
			rgba(212, 175, 55, 0.1),
			rgba(255, 215, 0, 0.3),
			rgba(212, 175, 55, 0.5)
		);
		border-radius: 26px;
		z-index: -1;
		animation: border-glow 4s ease-in-out infinite;
	}

	@keyframes border-glow {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 0.8; }
	}

	/* Top Decoration */
	.card-top-decoration {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.deco-star {
		font-size: 1.2rem;
		opacity: 0.6;
	}

	.deco-icon {
		font-size: 2rem;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
	}

	.deco-line {
		flex: 1;
		max-width: 100px;
		height: 2px;
		background: linear-gradient(90deg, 
			transparent, 
			rgba(212, 175, 55, 0.5), 
			transparent
		);
	}

	/* Question Meta */
	.question-meta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 2.5rem;
	}

	.category-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 50px;
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.badge-icon {
		font-size: 1.3rem;
	}

	.badge-text {
		font-family: 'Georgia', serif;
		font-size: 1.2rem;
		font-weight: bold;
		color: #fff8dc;
		letter-spacing: 0.05em;
	}

	.points-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, 
			rgba(212, 175, 55, 0.2),
			rgba(255, 215, 0, 0.1)
		);
		border-radius: 16px;
		border: 2px solid rgba(212, 175, 55, 0.5);
		box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
	}

	.points-value {
		font-family: 'Georgia', serif;
		font-size: 2rem;
		font-weight: bold;
		color: #ffd700;
		text-shadow: 0 2px 10px rgba(255, 215, 0, 0.4);
		line-height: 1;
	}

	.points-label {
		font-size: 0.7rem;
		color: rgba(255, 248, 220, 0.7);
		letter-spacing: 0.2em;
		margin-top: 0.25rem;
	}

	/* Question Content */
	.question-content {
		text-align: center;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.question-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.label-icon {
		font-size: 1.5rem;
	}

	.label-text {
		font-family: 'Georgia', serif;
		font-size: 1rem;
		color: rgba(212, 175, 55, 0.8);
		letter-spacing: 0.3em;
		font-weight: bold;
	}

	.question-text {
		font-family: 'Georgia', serif;
		font-size: clamp(1.8rem, 4vw, 3rem);
		font-weight: 500;
		color: #fff8dc;
		line-height: 1.5;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Bottom Decoration */
	.card-bottom-decoration {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.holly {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.question-card {
			max-width: 700px;
			padding: 2rem;
		}

		.question-text {
			font-size: clamp(1.5rem, 3.5vw, 2.5rem);
		}
	}

	@media (max-width: 900px) {
		.question-view {
			padding: 1rem;
			padding-bottom: 180px; /* Space for buzzer queue */
		}

		.question-card {
			padding: 1.5rem;
		}

		.question-meta {
			flex-direction: column;
			gap: 1rem;
		}

		.question-text {
			font-size: clamp(1.3rem, 3vw, 2rem);
		}

		.points-value {
			font-size: 1.5rem;
		}
	}
</style>
