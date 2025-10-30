/**
 * Game View State Management
 * SOLID-Prinzip: Single Responsibility - Nur Game View State
 * Agent 1 Bereich
 */
import { writable, derived } from 'svelte/store';
import type { Player, Question, MatrixCell, BuzzerEntry } from '$lib/shared';

export interface GameViewState {
	currentView: 'matrix' | 'question' | 'answer';
	selectedQuestion: Question | null;
	selectedAnswer: string | null;
	buzzerQueue: BuzzerEntry[];
	players: Player[];
	matrix: MatrixCell[][];
}

const initialState: GameViewState = {
	currentView: 'matrix',
	selectedQuestion: null,
	selectedAnswer: null,
	buzzerQueue: [],
	players: [],
	matrix: []
};

export const gameViewState = writable<GameViewState>(initialState);

// Derived: Sortierte Buzzer-Queue nach Reaktionszeit
export const sortedBuzzerQueue = derived(gameViewState, ($state) => {
	return [...$state.buzzerQueue].sort((a, b) => a.reactionTime - b.reactionTime);
});

// Derived: Kategorien aus Matrix extrahieren
export const categories = derived(gameViewState, ($state) => {
	if ($state.matrix.length === 0) return [];
	const firstRow = $state.matrix[0];
	const categorySet = new Set<number>();
	firstRow.forEach((cell) => {
		categorySet.add(cell.categoryIndex);
	});
	return Array.from(categorySet).sort((a, b) => a - b);
});

// Derived: Punktwerte aus Matrix extrahieren
export const pointValues = derived(gameViewState, ($state) => {
	if ($state.matrix.length === 0) return [];
	const pointSet = new Set<number>();
	$state.matrix.forEach((row) => {
		row.forEach((cell) => {
			if (cell.pointValue) pointSet.add(cell.pointValue);
		});
	});
	return Array.from(pointSet).sort((a, b) => a - b);
});

// Derived: Sortierte Spieler nach Score
export const sortedPlayers = derived(gameViewState, ($state) => {
	return [...$state.players].sort((a, b) => b.score - a.score);
});

