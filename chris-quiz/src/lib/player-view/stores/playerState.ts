/**
 * Player State Store
 * SOLID-Prinzip: Single Responsibility - Nur Player-spezifischer State
 * Agent 3 Bereich
 */
import { writable } from 'svelte/store';
import type { Player, Question } from '$lib/shared';

export interface PlayerState {
	playerId: string | null;
	playerName: string | null;
	loggedIn: boolean;
	buzzerEnabled: boolean;
	buzzed: boolean;
	buzzerPosition: number | null;
	players: Player[];
	currentQuestion: Question | null;
	currentView: 'login' | 'game';
}

const initialState: PlayerState = {
	playerId: null,
	playerName: null,
	loggedIn: false,
	buzzerEnabled: false,
	buzzed: false,
	buzzerPosition: null,
	players: [],
	currentQuestion: null,
	currentView: 'login'
};

// Prüfe LocalStorage für gespeicherte Session
if (typeof window !== 'undefined') {
	const savedPlayerId = localStorage.getItem('playerId');
	const savedPlayerName = localStorage.getItem('playerName');
	
	if (savedPlayerId && savedPlayerName) {
		initialState.playerId = savedPlayerId;
		initialState.playerName = savedPlayerName;
		initialState.loggedIn = true;
		initialState.currentView = 'game';
	}
}

export const playerState = writable<PlayerState>(initialState);

// Helper Functions
export function setPlayer(player: Player) {
	playerState.update((state) => ({
		...state,
		playerId: player.id,
		playerName: player.name,
		loggedIn: true,
		currentView: 'game'
	}));
	
	// Speichere in LocalStorage
	if (typeof window !== 'undefined') {
		localStorage.setItem('playerId', player.id);
		localStorage.setItem('playerName', player.name);
	}
}

export function logout() {
	playerState.set({
		playerId: null,
		playerName: null,
		loggedIn: false,
		buzzerEnabled: false,
		buzzed: false,
		buzzerPosition: null,
		players: [],
		currentQuestion: null,
		currentView: 'login'
	});
	
	// Entferne aus LocalStorage
	if (typeof window !== 'undefined') {
		localStorage.removeItem('playerId');
		localStorage.removeItem('playerName');
	}
}

export function setCurrentQuestion(question: Question | null) {
	playerState.update((state) => ({
		...state,
		currentQuestion: question
	}));
}

export function setBuzzerEnabled(enabled: boolean) {
	playerState.update((state) => ({
		...state,
		buzzerEnabled: enabled,
		// Reset buzzed state wenn Buzzer deaktiviert wird
		buzzed: enabled ? state.buzzed : false,
		buzzerPosition: enabled ? state.buzzerPosition : null
	}));
	
	// Wenn Buzzer deaktiviert wird, setze buzzed explizit auf null
	if (!enabled) {
		setBuzzed(null);
	}
}

export function setBuzzed(position: number | null) {
	playerState.update((state) => ({
		...state,
		buzzed: position !== null,
		buzzerPosition: position
	}));
}

export function updatePlayers(players: Player[]) {
	playerState.update((state) => ({
		...state,
		players: players.sort((a, b) => b.score - a.score)
	}));
}

export function updatePlayerScore(playerId: string, newScore: number) {
	playerState.update((state) => ({
		...state,
		players: state.players
			.map((p) => (p.id === playerId ? { ...p, score: newScore } : p))
			.sort((a, b) => b.score - a.score)
	}));
}

