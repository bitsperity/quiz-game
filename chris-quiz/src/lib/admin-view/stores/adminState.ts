/**
 * Admin View State Management
 * SOLID-Prinzip: Single Responsibility - Nur Admin State
 * Agent 2 Bereich
 */
import { writable, derived } from 'svelte/store';
import type { Player, Question, MatrixCell, BuzzerEntry } from '$lib/shared';

// Admin-spezifischer State
export const selectedCell = writable<{ category: number; points: number } | null>(null);
export const activePlayerId = writable<string | null>(null);
export const answerRevealed = writable<boolean>(false);
export const revealedAnswer = writable<string | null>(null);
export const gameState = writable<{
	currentView: 'matrix' | 'question-hidden' | 'question-reveal';
	selectedQuestion: Question | null;
	players: Player[];
	buzzerQueue: BuzzerEntry[];
	questionMatrix: MatrixCell[][];
	gamePhase: 'idle' | 'question' | 'answering' | 'scoring';
}>({
	currentView: 'matrix',
	selectedQuestion: null,
	players: [],
	buzzerQueue: [],
	questionMatrix: [],
	gamePhase: 'idle'
});

// Derived: Aktuelle Frage basierend auf ausgewählter Zelle
export const currentQuestion = derived(
	[gameState, selectedCell],
	([$gameState, $selectedCell]) => {
		if (!$selectedCell || !$gameState.selectedQuestion) return null;
		return $gameState.selectedQuestion;
	}
);

// Derived: Sortierte Spieler nach Score
export const sortedPlayers = derived(gameState, ($gameState) => {
	return [...$gameState.players].sort((a, b) => b.score - a.score);
});

// Derived: Aktuelle Kategorien und Punktwerte
export const categories = derived(gameState, ($gameState) => {
	if ($gameState.questionMatrix.length === 0) return [];
	const firstRow = $gameState.questionMatrix[0];
	return firstRow.map((cell) => cell.categoryIndex);
});

export const pointValues = derived(gameState, ($gameState) => {
	if ($gameState.questionMatrix.length === 0) return [];
	return $gameState.questionMatrix.map((row) => row[0]?.pointValue).filter(Boolean) as number[];
});

