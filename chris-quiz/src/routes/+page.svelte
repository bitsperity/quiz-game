<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to appropriate view based on query params or default to game view
		const urlParams = new URLSearchParams(window.location.search);
		const view = urlParams.get('view') || 'game';
		window.location.href = `/${view}`;
	});
</script>

<div class="loading">
	<p>Lade Quiz-App...</p>
</div>

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		font-size: 1.5rem;
	}
</style>

