import { getQuestionRepository } from '$lib/server/services/QuestionRepository';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const repo = getQuestionRepository();
    return {
        questions: repo.getAll()
    };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const category = data.get('category') as string;
        const points = Number(data.get('points'));
        const question = data.get('question') as string;
        const answer = data.get('answer') as string;

        if (!category || !points || !question || !answer) {
            return fail(400, { missing: true });
        }

        const repo = getQuestionRepository();
        repo.create({ category, points, question, answer });

        return { success: true };
    },

    delete: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) {
            return fail(400, { missing: true });
        }

        const repo = getQuestionRepository();
        repo.delete(id);

        return { success: true };
    },

    update: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;
        const category = data.get('category') as string;
        const points = Number(data.get('points'));
        const question = data.get('question') as string;
        const answer = data.get('answer') as string;

        if (!id || !category || !points || !question || !answer) {
            return fail(400, { missing: true });
        }

        const repo = getQuestionRepository();
        repo.update({ id, category, points, question, answer });

        return { success: true };
    }
};
