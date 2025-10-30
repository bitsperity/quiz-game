<script lang="ts">
	/**
	 * Login Component
	 * SOLID-Prinzip: Single Responsibility - Nur Login-Logik
	 * Agent 3 Bereich
	 */
	import { MIN_PLAYER_NAME_LENGTH, MAX_PLAYER_NAME_LENGTH } from '$lib/shared';
	
	export let onSubmit: (name: string) => Promise<void>;
	
	let playerName = '';
	let error = '';
	let loading = false;
	let nameExists = false;
	
	// Auto-Focus auf Input
	let nameInput: HTMLInputElement;
	
	function handleSubmit() {
		error = '';
		nameExists = false;
		
		const trimmedName = playerName.trim();
		
		if (trimmedName.length < MIN_PLAYER_NAME_LENGTH) {
			error = `Name muss mindestens ${MIN_PLAYER_NAME_LENGTH} Zeichen lang sein`;
			return;
		}
		
		if (trimmedName.length > MAX_PLAYER_NAME_LENGTH) {
			error = `Name darf maximal ${MAX_PLAYER_NAME_LENGTH} Zeichen lang sein`;
			return;
		}
		
		loading = true;
		onSubmit(trimmedName)
			.catch((e) => {
				error = e.message || 'Registrierung fehlgeschlagen';
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

<div class="login-container">
	<div class="login-box">
		<h1 class="title">🎄 WEIHNACHTS-QUIZ 🎄</h1>
		
		<div class="input-section">
			<label for="player-name" class="label">Gib deinen Namen ein:</label>
			<input
				id="player-name"
				type="text"
				bind:this={nameInput}
				bind:value={playerName}
				on:keydown={handleKeydown}
				placeholder="Dein Name"
				disabled={loading}
				class="login-input"
				class:error={!!error}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
			/>
			
			{#if error}
				<p class="error-message" class:warning={nameExists}>
					{error}
				</p>
			{/if}
			
			{#if nameExists}
				<p class="warning-text">
					⚠️ Dieser Name existiert bereits. Bitte wähle einen anderen Namen.
				</p>
			{/if}
		</div>
		
		<button
			class="login-button"
			on:click={handleSubmit}
			disabled={loading || !playerName.trim()}
		>
			{#if loading}
				<span class="spinner">⏳</span> Registriere...
			{:else}
				🚀 Spielen
			{/if}
		</button>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
	}
	
	.login-box {
		width: 100%;
		max-width: 400px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 215, 0, 0.2);
	}
	
	.title {
		text-align: center;
		color: #ffd700;
		font-size: 2rem;
		margin-bottom: 2rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}
	
	.input-section {
		margin-bottom: 1.5rem;
	}
	
	.label {
		display: block;
		color: #fff8dc;
		font-size: 1rem;
		margin-bottom: 0.75rem;
		text-align: center;
	}
	
	.login-input {
		width: 100%;
		padding: 1rem;
		font-size: 1.25rem;
		border: 2px solid rgba(255, 215, 0, 0.3);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.1);
		color: #fff8dc;
		text-align: center;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}
	
	.login-input:focus {
		outline: none;
		border-color: #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
		background: rgba(255, 255, 255, 0.15);
	}
	
	.login-input.error {
		border-color: #dc143c;
		box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
	}
	
	.login-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.error-message {
		margin-top: 0.5rem;
		color: #dc143c;
		font-size: 0.9rem;
		text-align: center;
		min-height: 1.2rem;
	}
	
	.error-message.warning {
		color: #ffd700;
	}
	
	.warning-text {
		margin-top: 0.5rem;
		color: #ffd700;
		font-size: 0.85rem;
		text-align: center;
	}
	
	.login-button {
		width: 100%;
		padding: 1rem 2rem;
		font-size: 1.25rem;
		font-weight: bold;
		background: linear-gradient(135deg, #dc143c, #ff6347);
		border: none;
		border-radius: 12px;
		color: white;
		cursor: pointer;
		min-height: 44px;
		touch-action: manipulation;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(220, 20, 60, 0.4);
	}
	
	.login-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(220, 20, 60, 0.6);
	}
	
	.login-button:active:not(:disabled) {
		transform: translateY(0);
	}
	
	.login-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	.spinner {
		display: inline-block;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	/* Mobile Optimierungen */
	@media (max-width: 480px) {
		.login-box {
			padding: 1.5rem;
		}
		
		.title {
			font-size: 1.5rem;
		}
		
		.login-input {
			font-size: 1rem;
			padding: 0.875rem;
		}
		
		.login-button {
			font-size: 1.1rem;
			padding: 0.875rem 1.5rem;
		}
	}
</style>

