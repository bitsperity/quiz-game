<script lang="ts">
	import '../app.css';
	import SnowEffect from '$lib/components/SnowEffect.svelte';
</script>

<SnowEffect />

<main>
	<slot />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>

