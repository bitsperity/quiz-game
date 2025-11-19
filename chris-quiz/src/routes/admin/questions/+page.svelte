<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    let editingId: string | null = null;
    let formCategory = '';
    let formPoints = 100;
    let formQuestion = '';
    let formAnswer = '';

    function startEdit(q: any) {
        editingId = q.id;
        formCategory = q.category;
        formPoints = q.points;
        formQuestion = q.question;
        formAnswer = q.answer;
    }

    function cancelEdit() {
        editingId = null;
        resetForm();
    }

    function resetForm() {
        formCategory = '';
        formPoints = 100;
        formQuestion = '';
        formAnswer = '';
    }
</script>

<div class="container">
    <div class="glass-panel form-section">
        <h2>{editingId ? 'Edit Question' : 'Add New Question'}</h2>
        <form method="POST" action={editingId ? '?/update' : '?/create'} use:enhance={() => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    cancelEdit();
                }
            };
        }}>
            {#if editingId}
                <input type="hidden" name="id" value={editingId} />
            {/if}
            
            <div class="form-group">
                <label for="category">Category</label>
                <input type="text" id="category" name="category" bind:value={formCategory} required placeholder="e.g. Christmas" />
            </div>
            
            <div class="form-group">
                <label for="points">Points</label>
                <select id="points" name="points" bind:value={formPoints}>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={300}>300</option>
                    <option value={400}>400</option>
                    <option value={500}>500</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="question">Question</label>
                <textarea id="question" name="question" bind:value={formQuestion} required rows="3"></textarea>
            </div>
            
            <div class="form-group">
                <label for="answer">Answer</label>
                <textarea id="answer" name="answer" bind:value={formAnswer} required rows="2"></textarea>
            </div>
            
            <div class="actions">
                {#if editingId}
                    <button type="button" class="btn-secondary" on:click={cancelEdit}>Cancel</button>
                {/if}
                <button type="submit" class="btn-gold">{editingId ? 'Update' : 'Create'}</button>
            </div>
        </form>
    </div>

    <div class="list-section">
        <h2>Existing Questions ({data.questions.length})</h2>
        <div class="grid">
            {#each data.questions as q}
                <div class="glass-panel question-card">
                    <div class="card-header">
                        <span class="badge">{q.category}</span>
                        <span class="points">{q.points}</span>
                    </div>
                    <p class="q-text">{q.question}</p>
                    <p class="a-text"><strong>A:</strong> {q.answer}</p>
                    <div class="card-actions">
                        <button class="btn-icon" on:click={() => startEdit(q)}>✏️</button>
                        <form method="POST" action="?/delete" use:enhance>
                            <input type="hidden" name="id" value={q.id} />
                            <button type="submit" class="btn-icon delete">🗑️</button>
                        </form>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .container {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 2rem;
    }

    .form-section {
        padding: 2rem;
        height: fit-content;
        position: sticky;
        top: 2rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-secondary);
        font-family: var(--font-heading);
    }

    input, select, textarea {
        width: 100%;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--glass-border);
        border-radius: 8px;
        color: var(--color-text);
        font-family: var(--font-body);
    }

    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--color-secondary);
    }

    .actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    .question-card {
        padding: 1.5rem;
        position: relative;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .badge {
        background: var(--color-primary);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        text-transform: uppercase;
    }

    .points {
        color: var(--color-secondary);
        font-weight: bold;
    }

    .q-text {
        margin: 0 0 0.5rem 0;
    }

    .a-text {
        color: var(--color-text-muted);
        font-size: 0.9rem;
        margin: 0;
    }

    .card-actions {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .question-card:hover .card-actions {
        opacity: 1;
    }

    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
    }

    .btn-secondary {
        background: transparent;
        border: 1px solid var(--color-text-muted);
        color: var(--color-text-muted);
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
    }
</style>
