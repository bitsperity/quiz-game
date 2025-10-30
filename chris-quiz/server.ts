/**
 * Custom Server für SvelteKit mit WebSocket Support
 * SOLID-Prinzip: Single Responsibility - Server Initialisierung
 */
import { handler } from './build/handler.js';
import express from 'express';
import { createServer } from 'http';
import { getWebSocketServer } from './src/lib/server/websocket/server.js';
import { getGameStateService } from './src/lib/server/services/GameStateService.js';
import { setWebSocketServer } from './src/lib/server/websocket/proxy.js';

const app = express();
const server = createServer(app);

// WebSocket Server initialisieren (async wegen dynamischem Import)
const wsServer = getWebSocketServer();
wsServer.initialize(server).then(() => {
	// Verbinde WebSocket Server mit Proxy NACH der Initialisierung
	setWebSocketServer(wsServer);
	console.log('[Server] WebSocket Server mit Proxy verbunden');
}).catch((error) => {
	console.error('[Server] Fehler beim Initialisieren des WebSocket Servers:', error);
});

// SvelteKit Handler
app.use(handler);

// Demo-Daten für Testing
const gameStateService = getGameStateService();
gameStateService.setQuestions([
	{
		id: 'q1',
		category: 'Weihnachten',
		points: 100,
		question: 'In welchem Land wurde Jesus geboren?',
		answer: 'Palästina (Bethlehem)'
	},
	{
		id: 'q2',
		category: 'Weihnachten',
		points: 200,
		question: 'Wie viele Rentiere hat der Weihnachtsmann?',
		answer: 'Acht'
	},
	{
		id: 'q3',
		category: 'Weihnachten',
		points: 300,
		question: 'Was ist das traditionelle Weihnachtsessen in England?',
		answer: 'Truthahn mit Plumpudding'
	},
	{
		id: 'q4',
		category: 'Geschichte',
		points: 100,
		question: 'In welchem Jahr endete der Zweite Weltkrieg?',
		answer: '1945'
	},
	{
		id: 'q5',
		category: 'Geschichte',
		points: 200,
		question: 'Wer war der erste Bundeskanzler der BRD?',
		answer: 'Konrad Adenauer'
	},
	{
		id: 'q6',
		category: 'Geschichte',
		points: 300,
		question: 'Wann fiel die Berliner Mauer?',
		answer: '9. November 1989'
	}
]);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`🚀 Server läuft auf Port ${PORT}`);
	console.log(`📡 WebSocket Server bereit auf ws://localhost:${PORT}/ws`);
});

