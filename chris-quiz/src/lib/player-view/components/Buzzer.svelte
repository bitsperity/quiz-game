<script lang="ts">
	/**
	 * Buzzer Component - iPhone optimiert
	 * Großer Touch-freundlicher Button mit cozy Weihnachts-Design
	 */
	export let enabled: boolean = false;
	export let buzzed: boolean = false;
	export let position: number | null = null;
	export let onPress: () => void = () => {};
	
	let pressed = false;
	
	function handlePress() {
		if (!enabled || buzzed) return;
		
		pressed = true;
		
		// Haptic Feedback
		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
		
		onPress();
		
		setTimeout(() => {
			pressed = false;
		}, 150);
	}
	
	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		handlePress();
	}
</script>

<div class="buzzer-container">
	<!-- Buzzer Button -->
	<button
		class="buzzer"
		class:active={enabled && !buzzed}
		class:buzzed={buzzed}
		class:pressed={pressed}
		class:disabled={!enabled && !buzzed}
		on:click={handlePress}
		on:touchstart={handleTouchStart}
		disabled={!enabled || buzzed}
		type="button"
	>
		<!-- Glow Effect -->
		<div class="glow"></div>
		
		<!-- Button Surface -->
		<div class="surface">
			<div class="icon">
				{#if buzzed}
					<span class="check">✓</span>
				{:else}
					<span class="bell">🔔</span>
				{/if}
			</div>
			
			<div class="label">
				{#if buzzed}
					Gebuzzt!
				{:else if enabled}
					BUZZ!
				{:else}
					Warten...
				{/if}
			</div>
		</div>
	</button>
	
	<!-- Status Message -->
	<div class="status">
		{#if buzzed && position !== null}
			<div class="position-badge">
				<span class="position-text">Platz</span>
				<span class="position-num">#{position}</span>
			</div>
		{:else if buzzed}
			<p class="status-msg confirming">Wird bestätigt...</p>
		{:else if enabled}
			<p class="status-msg ready">
				<span class="dot"></span>
				Drück jetzt!
			</p>
		{:else}
			<p class="status-msg waiting">🎄 Warte auf Frage...</p>
		{/if}
	</div>
</div>

<style>
	.buzzer-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 1rem;
		width: 100%;
		height: 100%;
	}

	/* === BUZZER BUTTON === */
	.buzzer {
		position: relative;
		width: clamp(200px, 55vw, 260px);
		aspect-ratio: 1;
		border: none;
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		user-select: none;
		transition: transform 0.15s ease;
		padding: 0;
	}

	.buzzer:disabled {
		cursor: default;
	}

	.buzzer.pressed {
		transform: scale(0.95);
	}

	/* === GLOW RING === */
	.glow {
		position: absolute;
		inset: -6px;
		border-radius: 50%;
		border: 2px solid rgba(100, 100, 100, 0.2);
		transition: all 0.3s ease;
	}

	.buzzer.active .glow {
		border-color: rgba(220, 38, 38, 0.5);
		box-shadow: 
			0 0 40px rgba(220, 38, 38, 0.4),
			0 0 80px rgba(220, 38, 38, 0.2);
		animation: pulse-glow 1.5s ease-in-out infinite;
	}

	.buzzer.buzzed .glow {
		border-color: rgba(34, 197, 94, 0.5);
		box-shadow: 
			0 0 40px rgba(34, 197, 94, 0.4),
			0 0 80px rgba(34, 197, 94, 0.2);
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 
				0 0 40px rgba(220, 38, 38, 0.4),
				0 0 80px rgba(220, 38, 38, 0.2);
		}
		50% {
			box-shadow: 
				0 0 60px rgba(220, 38, 38, 0.6),
				0 0 120px rgba(220, 38, 38, 0.3);
		}
	}

	/* === SURFACE === */
	.surface {
		position: absolute;
		inset: 8px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		transition: all 0.3s ease;
		
		/* Disabled State */
		background: linear-gradient(145deg, 
			rgba(55, 65, 81, 0.9) 0%,
			rgba(31, 41, 55, 0.95) 100%
		);
		border: 3px solid rgba(75, 85, 99, 0.5);
		box-shadow: 
			0 10px 40px rgba(0, 0, 0, 0.4),
			inset 0 2px 0 rgba(255, 255, 255, 0.1),
			inset 0 -4px 10px rgba(0, 0, 0, 0.3);
	}

	.buzzer.active .surface {
		background: linear-gradient(145deg, 
			#dc2626 0%,
			#b91c1c 50%,
			#991b1b 100%
		);
		border-color: rgba(248, 113, 113, 0.5);
		box-shadow: 
			0 10px 50px rgba(220, 38, 38, 0.5),
			inset 0 2px 0 rgba(255, 255, 255, 0.25),
			inset 0 -4px 15px rgba(0, 0, 0, 0.3);
	}

	.buzzer.buzzed .surface {
		background: linear-gradient(145deg, 
			#16a34a 0%,
			#15803d 50%,
			#166534 100%
		);
		border-color: rgba(74, 222, 128, 0.5);
		box-shadow: 
			0 10px 50px rgba(34, 197, 94, 0.4),
			inset 0 2px 0 rgba(255, 255, 255, 0.25),
			inset 0 -4px 15px rgba(0, 0, 0, 0.3);
	}

	.buzzer.pressed .surface {
		box-shadow: 
			0 4px 20px rgba(220, 38, 38, 0.6),
			inset 0 4px 15px rgba(0, 0, 0, 0.4);
	}

	/* === ICON === */
	.icon {
		font-size: clamp(3rem, 12vw, 4.5rem);
		line-height: 1;
		transition: all 0.3s ease;
	}

	.buzzer.disabled .icon {
		opacity: 0.4;
		filter: grayscale(0.5);
	}

	.buzzer.active .icon {
		animation: shake 0.4s ease-in-out infinite;
	}

	.check {
		color: white;
		font-weight: bold;
		text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
	}

	@keyframes shake {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(-8deg); }
		75% { transform: rotate(8deg); }
	}

	/* === LABEL === */
	.label {
		font-size: clamp(0.875rem, 3.5vw, 1.125rem);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.4);
		transition: all 0.3s ease;
	}

	.buzzer.active .label {
		color: white;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
	}

	.buzzer.buzzed .label {
		color: #bbf7d0;
		text-shadow: 0 0 10px rgba(187, 247, 208, 0.5);
	}

	/* === STATUS === */
	.status {
		min-height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-msg {
		font-size: 0.9375rem;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-msg.waiting {
		color: rgba(255, 255, 255, 0.4);
	}

	.status-msg.ready {
		color: #fbbf24;
		font-weight: 600;
		animation: fade-pulse 1s ease-in-out infinite;
	}

	.status-msg.confirming {
		color: rgba(255, 255, 255, 0.6);
	}

	@keyframes fade-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.dot {
		width: 8px;
		height: 8px;
		background: #dc2626;
		border-radius: 50%;
		animation: dot-pulse 1s ease-in-out infinite;
	}

	@keyframes dot-pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.4); opacity: 0.6; }
	}

	/* === POSITION BADGE === */
	.position-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.625rem 1.5rem;
		background: linear-gradient(135deg, 
			rgba(34, 197, 94, 0.2) 0%,
			rgba(22, 163, 74, 0.1) 100%
		);
		border: 1px solid rgba(34, 197, 94, 0.4);
		border-radius: 14px;
		animation: pop-in 0.25s ease-out;
	}

	@keyframes pop-in {
		from { transform: scale(0.8); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.position-text {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.position-num {
		font-size: 1.75rem;
		font-weight: 700;
		color: #86efac;
		text-shadow: 0 0 15px rgba(134, 239, 172, 0.5);
	}

	/* === KLEINE BILDSCHIRME === */
	@media (max-height: 667px) {
		.buzzer-container {
			gap: 1rem;
			padding: 0.5rem;
		}

		.buzzer {
			width: clamp(160px, 45vw, 200px);
		}

		.status {
			min-height: 40px;
		}
	}

	/* === LANDSCAPE === */
	@media (orientation: landscape) and (max-height: 500px) {
		.buzzer-container {
			flex-direction: row;
			gap: 1.5rem;
		}

		.buzzer {
			width: clamp(150px, 35vh, 180px);
		}
	}
</style>
