import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { websocketPlugin } from './vite-plugin-websocket';

export default defineConfig({
	plugins: [sveltekit(), websocketPlugin()],
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
