import db from '../db';
import type { Question } from '$lib/shared';
import { randomUUID } from 'crypto';

export class QuestionRepository {
    getAll(): Question[] {
        const stmt = db.prepare('SELECT * FROM questions ORDER BY category, points');
        return stmt.all() as Question[];
    }

    getById(id: string): Question | undefined {
        const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
        return stmt.get(id) as Question | undefined;
    }

    create(question: Omit<Question, 'id'>): Question {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO questions (id, category, points, question, answer)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(id, question.category, question.points, question.question, question.answer);

        return { id, ...question };
    }

    update(question: Question): void {
        const stmt = db.prepare(`
            UPDATE questions 
            SET category = ?, points = ?, question = ?, answer = ?
            WHERE id = ?
        `);

        stmt.run(question.category, question.points, question.question, question.answer, question.id);
    }

    delete(id: string): void {
        const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
        stmt.run(id);
    }

    deleteAll(): void {
        const stmt = db.prepare('DELETE FROM questions');
        stmt.run();
    }
}

// Singleton instance
let instance: QuestionRepository | null = null;

export function getQuestionRepository(): QuestionRepository {
    if (!instance) {
        instance = new QuestionRepository();
    }
    return instance;
}
