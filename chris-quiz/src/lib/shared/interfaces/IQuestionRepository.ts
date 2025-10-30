/**
 * Interface für Question Repository
 * SOLID-Prinzip: Single Responsibility - Separated Concerns
 */
import type { Question, Category } from '../types';

export interface IQuestionRepository {
	getAll(): Question[];
	getById(id: string): Question | null;
	getByCategory(category: string): Question[];
	getByPoints(points: number): Question[];
	create(question: Omit<Question, 'id'>): Question;
	update(id: string, question: Partial<Question>): Question | null;
	delete(id: string): boolean;
	getCategories(): Category[];
	importFromJSON(data: unknown[]): number;
}

