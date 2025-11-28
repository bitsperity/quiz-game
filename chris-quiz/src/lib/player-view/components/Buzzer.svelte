<script lang="ts">
	/**
	 * Buzzer Component - Elegant Christmas Design
	 * Immer sichtbar, leuchtet auf wenn aktiv
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
			navigator.vibrate(100);
		}
		
		onPress();
		
		setTimeout(() => {
			pressed = false;
		}, 200);
	}
	
	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		handlePress();
	}
</script>

<div class="buzzer-wrapper">
	<!-- Main Buzzer Button - Always Visible -->
	<button
		class="buzzer-button"
		class:active={enabled && !buzzed}
		class:buzzed={buzzed}
		class:pressed={pressed}
		class:disabled={!enabled && !buzzed}
		on:click={handlePress}
		on:touchstart={handleTouchStart}
		disabled={!enabled || buzzed}
		type="button"
	>
		<!-- Outer Glow Ring -->
		<div class="glow-ring"></div>
		
		<!-- Inner Button Face -->
		<div class="button-face">
			<!-- Icon -->
			<div class="buzzer-icon">
				{#if buzzed}
					✓
				{:else}
					🔔
				{/if}
			</div>
			
			<!-- Text -->
			<div class="buzzer-label">
				{#if buzzed}
					GEBUZZT!
				{:else if enabled}
					BUZZ!
				{:else}
					WARTEN
				{/if}
			</div>
		</div>

		<!-- Decorative Ring -->
		<div class="deco-ring"></div>
	</button>

	<!-- Status Text Below Button -->
	<div class="status-area">
		{#if buzzed && position !== null}
			<div class="position-badge">
				<span class="position-label">Platz</span>
				<span class="position-number">#{position}</span>
			</div>
		{:else if buzzed}
			<p class="status-text confirming">⏳ Wird bestätigt...</p>
		{:else if enabled}
			<p class="status-text ready">
				<span class="pulse-dot"></span>
				Jetzt drücken!
			</p>
		{:else}
			<p class="status-text waiting">🎄 Warte auf nächste Frage...</p>
		{/if}
	</div>
</div>

<style>
	.buzzer-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 1rem;
		width: 100%;
	}

	/* Main Button */
	.buzzer-button {
		position: relative;
		width: min(280px, 70vw);
		height: min(280px, 70vw);
		border: none;
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
		transition: transform 0.2s ease;
		padding: 0;
	}

	.buzzer-button:disabled {
		cursor: default;
	}

	.buzzer-button.active:not(.pressed):hover {
		transform: scale(1.03);
	}

	.buzzer-button.pressed {
		transform: scale(0.95);
	}

	/* Outer Glow Ring */
	.glow-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		background: transparent;
		border: 3px solid rgba(100, 100, 100, 0.2);
		transition: all 0.4s ease;
	}

	.buzzer-button.active .glow-ring {
		border-color: rgba(220, 20, 60, 0.6);
		box-shadow: 
			0 0 30px rgba(220, 20, 60, 0.4),
			0 0 60px rgba(220, 20, 60, 0.2),
			inset 0 0 30px rgba(220, 20, 60, 0.1);
		animation: glow-pulse 1.5s ease-in-out infinite;
	}

	.buzzer-button.buzzed .glow-ring {
		border-color: rgba(50, 205, 50, 0.6);
		box-shadow: 
			0 0 30px rgba(50, 205, 50, 0.4),
			0 0 60px rgba(50, 205, 50, 0.2);
	}

	/* Button Face */
	.button-face {
		position: absolute;
		inset: 12px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		
		/* Default inactive state */
		background: linear-gradient(145deg, 
			rgba(60, 60, 70, 0.9) 0%,
			rgba(40, 40, 50, 0.95) 100%
		);
		border: 4px solid rgba(80, 80, 90, 0.5);
		box-shadow: 
			0 8px 30px rgba(0, 0, 0, 0.4),
			inset 0 2px 0 rgba(255, 255, 255, 0.1),
			inset 0 -4px 10px rgba(0, 0, 0, 0.3);
	}

	.buzzer-button.active .button-face {
		background: linear-gradient(145deg, 
			#dc143c 0%,
			#b01030 50%,
			#8b0a24 100%
		);
		border-color: rgba(255, 100, 100, 0.5);
		box-shadow: 
			0 8px 40px rgba(220, 20, 60, 0.5),
			inset 0 2px 0 rgba(255, 255, 255, 0.2),
			inset 0 -4px 15px rgba(0, 0, 0, 0.3);
	}

	.buzzer-button.buzzed .button-face {
		background: linear-gradient(145deg, 
			#228b22 0%,
			#1a6b1a 50%,
			#145214 100%
		);
		border-color: rgba(100, 255, 100, 0.4);
		box-shadow: 
			0 8px 40px rgba(34, 139, 34, 0.4),
			inset 0 2px 0 rgba(255, 255, 255, 0.2),
			inset 0 -4px 15px rgba(0, 0, 0, 0.3);
	}

	.buzzer-button.pressed .button-face {
		box-shadow: 
			0 4px 20px rgba(220, 20, 60, 0.6),
			inset 0 4px 15px rgba(0, 0, 0, 0.4);
	}

	/* Decorative Ring */
	.deco-ring {
		position: absolute;
		inset: 4px;
		border-radius: 50%;
		border: 2px dashed rgba(255, 255, 255, 0.1);
		pointer-events: none;
	}

	.buzzer-button.active .deco-ring {
		border-color: rgba(255, 215, 0, 0.3);
		animation: spin-slow 20s linear infinite;
	}

	/* Icon */
	.buzzer-icon {
		font-size: clamp(3rem, 12vw, 5rem);
		line-height: 1;
		transition: all 0.3s ease;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.buzzer-button.disabled .buzzer-icon {
		opacity: 0.4;
		filter: grayscale(0.5);
	}

	.buzzer-button.active .buzzer-icon {
		animation: wiggle 0.5s ease-in-out infinite;
	}

	.buzzer-button.buzzed .buzzer-icon {
		color: #fff;
		font-size: clamp(3.5rem, 14vw, 6rem);
		text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
	}

	/* Label */
	.buzzer-label {
		font-family: 'Georgia', serif;
		font-size: clamp(1rem, 4vw, 1.5rem);
		font-weight: bold;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		transition: all 0.3s ease;
		color: rgba(255, 255, 255, 0.4);
	}

	.buzzer-button.active .buzzer-label {
		color: #fff;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
	}

	.buzzer-button.buzzed .buzzer-label {
		color: #90EE90;
		text-shadow: 0 0 10px rgba(144, 238, 144, 0.5);
	}

	/* Status Area */
	.status-area {
		min-height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-text {
		font-size: 1rem;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-text.waiting {
		color: rgba(255, 248, 220, 0.5);
	}

	.status-text.ready {
		color: #ffd700;
		font-weight: bold;
		animation: fade-pulse 1s ease-in-out infinite;
	}

	.status-text.confirming {
		color: rgba(255, 248, 220, 0.7);
	}

	.pulse-dot {
		width: 10px;
		height: 10px;
		background: #dc143c;
		border-radius: 50%;
		animation: pulse-dot 1s ease-in-out infinite;
	}

	/* Position Badge */
	.position-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 2rem;
		background: linear-gradient(135deg, rgba(50, 205, 50, 0.2), rgba(34, 139, 34, 0.1));
		border: 2px solid rgba(50, 205, 50, 0.5);
		border-radius: 16px;
		animation: pop-in 0.3s ease-out;
	}

	.position-label {
		font-size: 0.8rem;
		color: rgba(255, 248, 220, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.position-number {
		font-family: 'Georgia', serif;
		font-size: 2rem;
		font-weight: bold;
		color: #90EE90;
		text-shadow: 0 0 10px rgba(144, 238, 144, 0.5);
	}

	/* Animations */
	@keyframes glow-pulse {
		0%, 100% {
			box-shadow: 
				0 0 30px rgba(220, 20, 60, 0.4),
				0 0 60px rgba(220, 20, 60, 0.2),
				inset 0 0 30px rgba(220, 20, 60, 0.1);
		}
		50% {
			box-shadow: 
				0 0 50px rgba(220, 20, 60, 0.6),
				0 0 100px rgba(220, 20, 60, 0.3),
				inset 0 0 40px rgba(220, 20, 60, 0.15);
		}
	}

	@keyframes wiggle {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(-5deg); }
		75% { transform: rotate(5deg); }
	}

	@keyframes spin-slow {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes pulse-dot {
		0%, 100% { 
			transform: scale(1);
			opacity: 1;
		}
		50% { 
			transform: scale(1.3);
			opacity: 0.7;
		}
	}

	@keyframes fade-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	@keyframes pop-in {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Mobile */
	@media (max-width: 400px) {
		.buzzer-button {
			width: min(240px, 65vw);
			height: min(240px, 65vw);
		}
	}

	/* Landscape */
	@media (orientation: landscape) and (max-height: 500px) {
		.buzzer-wrapper {
			flex-direction: row;
			gap: 2rem;
		}

		.buzzer-button {
			width: min(200px, 40vh);
			height: min(200px, 40vh);
		}

		.status-area {
			min-height: auto;
		}
	}
</style>
