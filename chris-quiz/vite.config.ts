import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { websocketPlugin } from './vite-plugin-websocket';

export default defineConfig({
	plugins: [sveltekit(), websocketPlugin()],
	server: {
		port: 54321,
		host: '0.0.0.0',
		watch: {
			usePolling: true, // Wichtig für Docker Hot Reload
			interval: 300
		},
		hmr: false // HMR in Docker deaktiviert - manueller Reload erforderlich
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
