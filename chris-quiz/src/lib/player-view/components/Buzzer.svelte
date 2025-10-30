<script lang="ts">
	/**
	 * Buzzer Component
	 * SOLID-Prinzip: Single Responsibility - Nur Buzzer-Logik
	 * Agent 3 Bereich
	 */
	export let enabled: boolean = false;
	export let buzzed: boolean = false;
	export let position: number | null = null;
	export let onPress: () => void = () => {};
	
	let pressed = false;
	
	function handlePress() {
		if (!enabled || buzzed) {
			return;
		}
		
		pressed = true;
		
		// Haptic Feedback (falls verfügbar)
		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
		
		// Callback aufrufen
		onPress();
		
		// Reset pressed state nach kurzer Zeit
		setTimeout(() => {
			pressed = false;
		}, 200);
	}
	
	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		handlePress();
	}
</script>

<div class="buzzer-container">
	{#if !enabled}
		<div class="buzzer-disabled">
			<p class="status-text">💡 Warte auf Frage...</p>
		</div>
	{:else if buzzed}
		<div class="buzzer-buzzed">
			<h2 class="buzzed-title">🔔 Du hast gebuzzt!</h2>
			{#if position !== null}
				<p class="position">Position: #{position}</p>
			{:else}
				<p class="position">Warte auf Bestätigung...</p>
			{/if}
		</div>
	{:else}
		<button
			class="buzzer-button"
			class:pressed={pressed}
			on:click={handlePress}
			on:touchstart={handleTouchStart}
			type="button"
		>
			<span class="buzzer-icon">🎅</span>
			<span class="buzzer-text">BUZZER</span>
		</button>
	{/if}
</div>

<style>
	.buzzer-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		min-height: 200px;
	}
	
	.buzzer-button {
		width: 100%;
		max-width: 300px;
		aspect-ratio: 1;
		border: none;
		border-radius: 50%;
		background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
		box-shadow: 0 8px 32px rgba(220, 20, 60, 0.4);
		cursor: pointer;
		touch-action: manipulation;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		position: relative;
	}
	
	.buzzer-button:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 12px 40px rgba(220, 20, 60, 0.6);
	}
	
	.buzzer-button:active,
	.buzzer-button.pressed {
		transform: scale(0.95);
		box-shadow: 0 4px 16px rgba(220, 20, 60, 0.6);
	}
	
	.buzzer-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.buzzer-icon {
		font-size: 4rem;
		margin-bottom: 0.5rem;
		display: block;
		animation: sparkle 2s ease-in-out infinite;
	}
	
	.buzzer-text {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
		letter-spacing: 0.1em;
	}
	
	.buzzer-disabled {
		text-align: center;
		color: rgba(255, 248, 220, 0.5);
		width: 100%;
	}
	
	.status-text {
		font-size: 1.25rem;
		margin: 0;
	}
	
	.buzzer-buzzed {
		text-align: center;
		color: #ffd700;
		width: 100%;
		padding: 2rem;
	}
	
	.buzzed-title {
		font-size: 2rem;
		margin-bottom: 1rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
		animation: pulse 1s ease-in-out infinite;
	}
	
	.position {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
		color: #ffd700;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}
	
	/* Weihnachtliche Animationen */
	@keyframes sparkle {
		0%,
		100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
		50% {
			opacity: 0.9;
			transform: scale(1.1) rotate(5deg);
		}
	}
	
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.9;
		}
	}
	
	/* Mobile Optimierungen */
	@media (max-width: 480px) {
		.buzzer-container {
			padding: 1rem;
		}
		
		.buzzer-button {
			max-width: 250px;
		}
		
		.buzzer-icon {
			font-size: 3rem;
		}
		
		.buzzer-text {
			font-size: 1.25rem;
		}
		
		.buzzed-title {
			font-size: 1.5rem;
		}
		
		.position {
			font-size: 1.25rem;
		}
	}
	
	@media (orientation: landscape) and (max-height: 500px) {
		.buzzer-button {
			max-width: 200px;
		}
		
		.buzzer-icon {
			font-size: 2.5rem;
		}
		
		.buzzer-text {
			font-size: 1rem;
		}
	}
</style>

