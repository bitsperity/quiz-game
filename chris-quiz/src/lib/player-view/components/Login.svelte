<script lang="ts">
	/**
	 * Login Component - iPhone optimiert
	 * SOLID-Prinzip: Single Responsibility - Nur Login-Logik
	 * Agent 3 Bereich
	 */
	import { MIN_PLAYER_NAME_LENGTH, MAX_PLAYER_NAME_LENGTH } from '$lib/shared';
	
	export let onSubmit: (name: string) => Promise<void>;
	
	let playerName = '';
	let error = '';
	let loading = false;
	let nameExists = false;
	
	function handleSubmit() {
		error = '';
		nameExists = false;
		
		const trimmedName = playerName.trim();
		
		if (trimmedName.length < MIN_PLAYER_NAME_LENGTH) {
			error = `Mindestens ${MIN_PLAYER_NAME_LENGTH} Zeichen`;
			return;
		}
		
		if (trimmedName.length > MAX_PLAYER_NAME_LENGTH) {
			error = `Maximal ${MAX_PLAYER_NAME_LENGTH} Zeichen`;
			return;
		}
		
		loading = true;
		onSubmit(trimmedName)
			.catch((e) => {
				error = e.message || 'Fehler';
				if (e.message?.includes('existiert') || e.message?.includes('bereits')) {
					nameExists = true;
				}
			})
			.finally(() => {
				loading = false;
			});
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !loading) {
			handleSubmit();
		}
	}
</script>

<div class="login-screen">
	<!-- Schneeflocken Hintergrund -->
	<div class="snowflakes" aria-hidden="true">
		{#each Array(12) as _, i}
			<div class="snowflake" style="--i: {i}">❄</div>
		{/each}
	</div>
	
	<div class="login-content">
		<!-- Header mit Weihnachtsbaum -->
		<div class="christmas-header">
			<div class="tree-container">
				<span class="tree">🎄</span>
			</div>
			<h1 class="title">Weihnachts<br/>Quiz</h1>
			<div class="ornaments">
				<span class="ornament" style="--delay: 0s">✨</span>
				<span class="ornament" style="--delay: 0.5s">⭐</span>
				<span class="ornament" style="--delay: 1s">✨</span>
			</div>
		</div>
		
		<!-- Login Form -->
		<div class="login-card">
			<div class="form-group">
				<label for="player-name" class="label">
					<span class="label-icon">👤</span>
					Dein Name
				</label>
				<input
					id="player-name"
					type="text"
					bind:value={playerName}
					on:keydown={handleKeydown}
					placeholder="Wie heißt du?"
					disabled={loading}
					class="name-input"
					class:has-error={!!error}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="words"
					spellcheck="false"
					enterkeyhint="go"
				/>
			</div>
			
			{#if error}
				<div class="error-box" class:warning={nameExists}>
					<span class="error-icon">{nameExists ? '⚠️' : '❌'}</span>
					<span class="error-text">{error}</span>
				</div>
			{/if}
			
			<button
				class="join-button"
				on:click={handleSubmit}
				disabled={loading || !playerName.trim()}
			>
				{#if loading}
					<span class="loading-spinner"></span>
					<span>Moment...</span>
				{:else}
					<span class="button-icon">🎅</span>
					<span>Mitspielen!</span>
				{/if}
			</button>
		</div>
		
		<!-- Footer -->
		<p class="footer-text">Frohe Weihnachten! 🎁</p>
	</div>
</div>

<style>
	/* === BASE STYLES === */
	.login-screen {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, 
			#0d1b2a 0%, 
			#1b263b 40%, 
			#2d3a4f 100%
		);
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
	}
	
	/* === SCHNEEFLOCKEN ANIMATION === */
	.snowflakes {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	
	.snowflake {
		position: absolute;
		top: -20px;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.6);
		animation: fall linear infinite;
		animation-duration: calc(8s + var(--i) * 2s);
		animation-delay: calc(var(--i) * -1.5s);
		left: calc(var(--i) * 8.33%);
		opacity: calc(0.3 + var(--i) * 0.05);
	}
	
	@keyframes fall {
		0% {
			transform: translateY(-20px) rotate(0deg);
		}
		100% {
			transform: translateY(100vh) rotate(360deg);
		}
	}
	
	/* === CONTENT CONTAINER === */
	.login-content {
		position: relative;
		z-index: 1;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		padding-top: max(2rem, env(safe-area-inset-top));
		padding-bottom: max(2rem, env(safe-area-inset-bottom));
	}
	
	/* === CHRISTMAS HEADER === */
	.christmas-header {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.tree-container {
		margin-bottom: 0.5rem;
	}
	
	.tree {
		font-size: 4rem;
		display: block;
		animation: glow 2s ease-in-out infinite;
		filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5));
	}
	
	@keyframes glow {
		0%, 100% { filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5)); }
		50% { filter: drop-shadow(0 0 30px rgba(34, 197, 94, 0.8)); }
	}
	
	.title {
		font-size: 2.5rem;
		font-weight: 800;
		color: #fbbf24;
		text-shadow: 
			0 2px 10px rgba(251, 191, 36, 0.5),
			0 0 40px rgba(251, 191, 36, 0.3);
		margin: 0;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}
	
	.ornaments {
		margin-top: 0.75rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
	
	.ornament {
		font-size: 1.25rem;
		animation: twinkle 1.5s ease-in-out infinite;
		animation-delay: var(--delay);
	}
	
	@keyframes twinkle {
		0%, 100% { opacity: 0.4; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.2); }
	}
	
	/* === LOGIN CARD === */
	.login-card {
		width: 100%;
		max-width: 340px;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 24px;
		padding: 1.75rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 
			0 20px 40px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}
	
	/* === FORM === */
	.form-group {
		margin-bottom: 1rem;
	}
	
	.label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.625rem;
		padding-left: 0.25rem;
	}
	
	.label-icon {
		font-size: 1rem;
	}
	
	.name-input {
		width: 100%;
		padding: 1rem 1.25rem;
		font-size: 1.125rem;
		font-weight: 500;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-radius: 14px;
		background: rgba(0, 0, 0, 0.3);
		color: #fff;
		transition: all 0.2s ease;
		box-sizing: border-box;
		-webkit-appearance: none;
		appearance: none;
	}
	
	.name-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	
	.name-input:focus {
		outline: none;
		border-color: #fbbf24;
		background: rgba(0, 0, 0, 0.4);
		box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.2);
	}
	
	.name-input.has-error {
		border-color: #ef4444;
		box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
	}
	
	.name-input:disabled {
		opacity: 0.5;
	}
	
	/* === ERROR BOX === */
	.error-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 10px;
		margin-bottom: 1rem;
	}
	
	.error-box.warning {
		background: rgba(251, 191, 36, 0.15);
		border-color: rgba(251, 191, 36, 0.3);
	}
	
	.error-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}
	
	.error-text {
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	/* === JOIN BUTTON === */
	.join-button {
		width: 100%;
		padding: 1rem 1.5rem;
		font-size: 1.125rem;
		font-weight: 700;
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		border: none;
		border-radius: 14px;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		min-height: 56px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition: all 0.2s ease;
		box-shadow: 
			0 4px 14px rgba(220, 38, 38, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}
	
	.join-button:active:not(:disabled) {
		transform: scale(0.98);
		box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
	}
	
	.join-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.button-icon {
		font-size: 1.5rem;
	}
	
	/* === LOADING SPINNER === */
	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	/* === FOOTER === */
	.footer-text {
		margin-top: 2rem;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.875rem;
		text-align: center;
	}
	
	/* === KLEINE BILDSCHIRME (iPhone SE) === */
	@media (max-height: 667px) {
		.login-content {
			padding: 1.5rem 1.25rem;
			justify-content: flex-start;
			padding-top: calc(max(1rem, env(safe-area-inset-top)) + 1rem);
		}
		
		.tree {
			font-size: 3rem;
		}
		
		.title {
			font-size: 2rem;
		}
		
		.christmas-header {
			margin-bottom: 1.5rem;
		}
		
		.login-card {
			padding: 1.5rem;
		}
		
		.footer-text {
			margin-top: 1.5rem;
		}
	}
	
	/* === LANDSCAPE MODE === */
	@media (orientation: landscape) and (max-height: 500px) {
		.login-content {
			flex-direction: row;
			gap: 2rem;
			padding: 1rem 2rem;
		}
		
		.christmas-header {
			margin-bottom: 0;
		}
		
		.tree {
			font-size: 2.5rem;
		}
		
		.title {
			font-size: 1.75rem;
		}
		
		.login-card {
			max-width: 300px;
		}
		
		.footer-text {
			display: none;
		}
	}
</style>
