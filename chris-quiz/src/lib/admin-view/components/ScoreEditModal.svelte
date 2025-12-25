<script lang="ts">
	/**
	 * Score Edit Modal - Admin View
	 * Ermöglicht das direkte Setzen von Spielerpunkten
	 */
	import { createEventDispatcher } from 'svelte';

	export let playerName: string;
	export let playerId: string;
	export let currentScore: number;
	export let isOpen: boolean = false;

	const dispatch = createEventDispatcher<{
		close: void;
		save: { playerId: string; newScore: number };
	}>();

	let inputValue: string = '';
	let inputElement: HTMLInputElement;
	let wasOpen: boolean = false;

	// Nur beim Öffnen des Modals den Wert setzen (nicht bei jedem Re-Render)
	$: {
		if (isOpen && !wasOpen) {
			// Modal wurde gerade geöffnet
			inputValue = currentScore.toString();
			setTimeout(() => inputElement?.focus(), 50);
		}
		wasOpen = isOpen;
	}

	function handleSave() {
		const newScore = parseInt(inputValue, 10);
		if (!isNaN(newScore) && newScore >= 0) {
			dispatch('save', { playerId, newScore });
			dispatch('close');
		}
	}

	function handleCancel() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSave();
		} else if (e.key === 'Escape') {
			handleCancel();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleCancel();
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-header">
				<i class="fas fa-edit"></i>
				<h3 id="modal-title">Punkte bearbeiten</h3>
			</div>
			
			<div class="modal-body">
				<div class="player-info">
					<i class="fas fa-user"></i>
					<span class="player-name">{playerName}</span>
				</div>
				
				<div class="input-group">
					<label for="score-input">Neue Punktzahl</label>
					<input
						bind:this={inputElement}
						id="score-input"
						type="number"
						min="0"
						bind:value={inputValue}
						on:keydown={handleKeydown}
						placeholder="0"
					/>
				</div>
				
				<div class="current-score-info">
					<span class="label">Aktuell:</span>
					<span class="value">{currentScore} Pkt</span>
				</div>
			</div>
			
			<div class="modal-footer">
				<button class="btn-cancel" on:click={handleCancel}>
					<i class="fas fa-times"></i>
					Abbrechen
				</button>
				<button class="btn-save" on:click={handleSave}>
					<i class="fas fa-check"></i>
					Speichern
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: linear-gradient(180deg, rgba(28, 35, 42, 0.98) 0%, rgba(18, 24, 30, 0.99) 100%);
		border: 1px solid rgba(212, 175, 55, 0.25);
		border-radius: 12px;
		box-shadow: 
			0 20px 60px rgba(0, 0, 0, 0.5),
			0 0 40px rgba(212, 175, 55, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		width: 100%;
		max-width: 320px;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.8rem 1rem;
		background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.03) 100%);
		border-bottom: 1px solid rgba(212, 175, 55, 0.15);
	}

	.modal-header i {
		color: #d4af37;
		font-size: 0.9rem;
	}

	.modal-header h3 {
		margin: 0;
		font-family: 'Cinzel', serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: #d4af37;
		letter-spacing: 0.05em;
	}

	.modal-body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.player-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.8rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.player-info i {
		color: rgba(212, 175, 55, 0.7);
		font-size: 0.75rem;
	}

	.player-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #f5f0e1;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.input-group label {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.input-group input {
		width: 100%;
		padding: 0.7rem 0.9rem;
		font-size: 1.2rem;
		font-weight: 700;
		text-align: center;
		color: #f5f0e1;
		background: rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(212, 175, 55, 0.2);
		border-radius: 8px;
		outline: none;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.input-group input:focus {
		border-color: rgba(212, 175, 55, 0.5);
		background: rgba(0, 0, 0, 0.4);
		box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
	}

	.input-group input::placeholder {
		color: rgba(255, 255, 255, 0.2);
	}

	/* Hide number input spinners */
	.input-group input::-webkit-outer-spin-button,
	.input-group input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.input-group input[type=number] {
		-moz-appearance: textfield;
	}

	.current-score-info {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.current-score-info .value {
		color: rgba(212, 175, 55, 0.7);
		font-weight: 600;
	}

	.modal-footer {
		display: flex;
		gap: 0.5rem;
		padding: 0.8rem 1rem;
		background: rgba(0, 0, 0, 0.15);
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.modal-footer button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.6rem 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.modal-footer button i {
		font-size: 0.65rem;
	}

	.btn-cancel {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.6);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.btn-cancel:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
	}

	.btn-save {
		background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
		color: #a8d5a2;
		border-color: rgba(45, 90, 61, 0.4);
	}

	.btn-save:hover {
		background: linear-gradient(135deg, #2d5a3d 0%, #3d7a50 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(45, 90, 61, 0.3);
	}
</style>

