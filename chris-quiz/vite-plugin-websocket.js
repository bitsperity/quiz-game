/**
 * Vite Plugin für WebSocket Server Initialisierung
 * 
 * Initialisiert den WebSocket Server auch im Dev-Modus (vite dev)
 * und verbindet ihn mit dem Proxy für API Routes
 */
import { createServer } from 'http';

let wsServerInstance = null;
let httpServer = null;
let initPromise = null; // Promise um mehrfache Initialisierung zu verhindern

export function websocketPlugin() {
	return {
		name: 'websocket-server',
		configureServer(server) {
			// HTTP Server aus Vite Dev Server extrahieren
			httpServer = server.httpServer;
			
			if (!httpServer) {
				console.warn('[Vite WS Plugin] HTTP Server nicht gefunden');
				return;
			}
			
			// Prüfe ob bereits initialisiert (via Proxy)
			(async () => {
				try {
					const proxyModule = await import('./src/lib/server/websocket/proxy.js');
					const proxy = proxyModule.getWebSocketServerProxy();
					if (proxy) {
						console.log('[Vite WS Plugin] WebSocket Server bereits initialisiert (via Proxy)');
						return;
					}
				} catch (e) {
					// Ignoriere Fehler beim Prüfen
				}
			})();
			
			// Verhindere mehrfache Initialisierung - verwende Promise
			if (initPromise) {
				console.log('[Vite WS Plugin] Initialisierung läuft bereits');
				return;
			}

			// Initialisiere WebSocket Server nach dem Server-Start
			const initWebSocket = async () => {
				// Prüfe nochmal ob bereits initialisiert
				try {
					const proxyModule = await import('./src/lib/server/websocket/proxy.js');
					const proxy = proxyModule.getWebSocketServerProxy();
					if (proxy) {
						console.log('[Vite WS Plugin] WebSocket Server bereits initialisiert');
						return;
					}
				} catch (e) {
					// Weiter mit Initialisierung
				}
				
				try {
					console.log('[Vite WS Plugin] Starte Initialisierung...');
					
					// Verwende die gleichen Import-Pfade wie im Custom Server
					const serverModule = await import('./src/lib/server/websocket/server.js');
					const proxyModule = await import('./src/lib/server/websocket/proxy.js');
					
					wsServerInstance = serverModule.getWebSocketServer();
					
					// Initialisiere WebSocket Server mit HTTP Server
					await wsServerInstance.initialize(httpServer);
					
					// Verbinde mit Proxy für API Routes
					proxyModule.setWebSocketServer(wsServerInstance);
					
					console.log('[Vite WS Plugin] ✅ WebSocket Server initialisiert auf /ws');
					initPromise = null; // Reset Promise nach erfolgreicher Initialisierung
				} catch (error) {
					initPromise = null; // Reset Promise bei Fehler
					console.error('[Vite WS Plugin] ❌ Fehler beim Initialisieren des WebSocket Servers:', error);
					console.error('[Vite WS Plugin] Error Details:', error.message);
					if (error.stack) {
						console.error('[Vite WS Plugin] Stack:', error.stack);
					}
				}
			};
			
			// Initialisiere nach dem Server-Start
			// Verwende einen Polling-Ansatz, da das listening Event nicht zuverlässig funktioniert
			const tryInit = async () => {
				if (httpServer.listening) {
					await initWebSocket();
				} else {
					// Versuche es in 500ms nochmal
					setTimeout(tryInit, 500);
				}
			};
			
			// Starte nach kurzer Verzögerung
			initPromise = Promise.resolve().then(() => {
				setTimeout(tryInit, 2000); // Warte 2 Sekunden damit Server wirklich läuft
			});
		},
		buildEnd() {
			// Cleanup beim Build
			if (wsServerInstance && typeof wsServerInstance.close === 'function') {
				wsServerInstance.close();
			}
		}
	};
}

