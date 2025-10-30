/**
 * Server Hooks
 * SOLID-Prinzip: Single Responsibility - Server-seitige Initialisierung
 */
import type { Handle } from '@sveltejs/kit';
import { getGameStateService } from '$lib/server/services/GameStateService';
import type { Question } from '$lib/shared';

// Demo-Fragen für Development
const DEFAULT_QUESTIONS: Question[] = [
	{ id: 'q1', category: 'Weihnachten', points: 100, question: 'In welchem Land wurde Jesus geboren?', answer: 'Palästina (Bethlehem)' },
	{ id: 'q2', category: 'Weihnachten', points: 200, question: 'Wie viele Rentiere hat der Weihnachtsmann?', answer: 'Acht' },
	{ id: 'q3', category: 'Weihnachten', points: 300, question: 'Was ist das traditionelle Weihnachtsessen in England?', answer: 'Truthahn mit Plumpudding' },
	{ id: 'q4', category: 'Weihnachten', points: 400, question: 'In welchem Jahr wurde das erste Weihnachtsfest offiziell gefeiert?', answer: '336 n. Chr. in Rom' },
	{ id: 'q5', category: 'Weihnachten', points: 500, question: 'Was bedeutet \'Advent\' auf Latein?', answer: 'Ankunft (adventus)' },
	{ id: 'q6', category: 'Geschichte', points: 100, question: 'In welchem Jahr endete der Zweite Weltkrieg?', answer: '1945' },
	{ id: 'q7', category: 'Geschichte', points: 200, question: 'Wer war der erste Bundeskanzler der BRD?', answer: 'Konrad Adenauer' },
	{ id: 'q8', category: 'Geschichte', points: 300, question: 'Wann fiel die Berliner Mauer?', answer: '9. November 1989' },
	{ id: 'q9', category: 'Geschichte', points: 400, question: 'Welcher römische Kaiser wurde im Jahr 44 v. Chr. ermordet?', answer: 'Julius Caesar' },
	{ id: 'q10', category: 'Geschichte', points: 500, question: 'In welchem Jahr wurde die Französische Revolution beendet?', answer: '1799 (Napoleon putschte)' },
	{ id: 'q11', category: 'Geographie', points: 100, question: 'Wie viele Kontinente gibt es?', answer: 'Sieben' },
	{ id: 'q12', category: 'Geographie', points: 200, question: 'Welches ist der längste Fluss der Welt?', answer: 'Der Nil (oder Amazonas, je nach Messung)' },
	{ id: 'q13', category: 'Geographie', points: 300, question: 'Wie heißt die Hauptstadt von Australien?', answer: 'Canberra' },
	{ id: 'q14', category: 'Geographie', points: 400, question: 'Welches ist das kleinste Land der Welt?', answer: 'Vatikanstadt' },
	{ id: 'q15', category: 'Geographie', points: 500, question: 'Durch wie viele Länder fließt der Rhein?', answer: 'Sechs (Schweiz, Liechtenstein, Österreich, Deutschland, Frankreich, Niederlande)' },
	{ id: 'q16', category: 'Wissenschaft', points: 100, question: 'Wie viele Planeten gibt es in unserem Sonnensystem?', answer: 'Acht' },
	{ id: 'q17', category: 'Wissenschaft', points: 200, question: 'Was ist die chemische Formel für Wasser?', answer: 'H2O' },
	{ id: 'q18', category: 'Wissenschaft', points: 300, question: 'Wie schnell ist das Licht im Vakuum?', answer: '299.792.458 Meter pro Sekunde' },
	{ id: 'q19', category: 'Wissenschaft', points: 400, question: 'Wer entwickelte die Relativitätstheorie?', answer: 'Albert Einstein' },
	{ id: 'q20', category: 'Wissenschaft', points: 500, question: 'Wie heißt das chemische Element mit dem Symbol \'Au\'?', answer: 'Gold (Aurum)' },
	{ id: 'q21', category: 'Kultur & Literatur', points: 100, question: 'Wer schrieb \'Romeo und Julia\'?', answer: 'William Shakespeare' },
	{ id: 'q22', category: 'Kultur & Literatur', points: 200, question: 'Wie heißt der Autor von \'Der kleine Prinz\'?', answer: 'Antoine de Saint-Exupéry' },
	{ id: 'q23', category: 'Kultur & Literatur', points: 300, question: 'In welcher Stadt spielt Goethes \'Faust\'?', answer: 'In mehreren Städten, hauptsächlich jedoch in Wittenberg und Weimar' },
	{ id: 'q24', category: 'Kultur & Literatur', points: 400, question: 'Wer komponierte die \'Zauberflöte\'?', answer: 'Wolfgang Amadeus Mozart' },
	{ id: 'q25', category: 'Kultur & Literatur', points: 500, question: 'Wie heißt der erste Band von Tolkiens \'Der Herr der Ringe\'?', answer: 'Die Gefährten (The Fellowship of the Ring)' }
];

function initializeQuestions() {
	try {
		const gameStateService = getGameStateService();
		const state = gameStateService.getState();
		
		// Initialisiere wenn Matrix leer ist (auch nach Reset)
		if (state.questionMatrix.length === 0) {
			gameStateService.setQuestions(DEFAULT_QUESTIONS);
			console.log(`[Hooks] ${DEFAULT_QUESTIONS.length} Fragen initialisiert - 5 Kategorien mit je 100, 200, 300, 400, 500 Punkte`);
		}
	} catch (error) {
		console.error('[Hooks] Fehler bei Fragen-Initialisierung:', error);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	// Fragen beim ersten Request initialisieren
	initializeQuestions();
	
	return resolve(event);
};
