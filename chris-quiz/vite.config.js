import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 54321,
		host: true,
		watch: {
			usePolling: true, // Wichtig für Docker Hot Reload
			interval: 1000
		},
		hmr: {
			clientPort: 54321
		}
	},
	ssr: {
		// Server-only Module, die nicht gebundelt werden sollen
		noExternal: [],
		// Externe Module, die im SSR-Kontext verfügbar sein müssen
		external: ['ws']
	},
	optimizeDeps: {
		exclude: ['ws']
	}
});
