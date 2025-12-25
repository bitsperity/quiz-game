<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    $: token = $page.url.searchParams.get('token');
    
    let editingId: string | null = null;
    let formCategory = '';
    let formPoints = 100;
    let formQuestion = '';
    let formAnswer = '';
    let showForm = false;

    function startEdit(q: any) {
        editingId = q.id;
        formCategory = q.category;
        formPoints = q.points;
        formQuestion = q.question;
        formAnswer = q.answer;
        showForm = true;
    }

    function cancelEdit() {
        editingId = null;
        resetForm();
        showForm = false;
    }

    function resetForm() {
        formCategory = '';
        formPoints = 100;
        formQuestion = '';
        formAnswer = '';
    }

    function openNewForm() {
        cancelEdit();
        showForm = true;
    }
</script>

<div class="questions-page">
    <header class="page-header">
        <div class="header-left">
            <a href="/admin?token={token}" class="btn-back" title="Zurück zum Dashboard">
                <i class="fas fa-arrow-left"></i>
            </a>
            <i class="fas fa-list-check header-icon"></i>
            <h1>Fragen verwalten</h1>
            <span class="question-count">{data.questions.length}</span>
        </div>
        <button class="btn-add" on:click={openNewForm}>
            <i class="fas fa-plus"></i>
            <span>Neue Frage</span>
        </button>
    </header>

    <div class="content-area">
        {#if showForm}
            <div class="form-panel">
                <div class="form-header">
                    <h2>
                        <i class="fas {editingId ? 'fa-edit' : 'fa-plus-circle'}"></i>
                        {editingId ? 'Frage bearbeiten' : 'Neue Frage'}
                    </h2>
                    <button class="btn-close" on:click={cancelEdit}>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
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
            
                    <div class="form-row">
            <div class="form-group">
                            <label for="category">
                                <i class="fas fa-folder"></i>
                                Kategorie
                            </label>
                            <input type="text" id="category" name="category" bind:value={formCategory} required placeholder="z.B. Weihnachten" />
            </div>
            
                        <div class="form-group form-group-small">
                            <label for="points">
                                <i class="fas fa-star"></i>
                                Punkte
                            </label>
                <select id="points" name="points" bind:value={formPoints}>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={300}>300</option>
                    <option value={400}>400</option>
                    <option value={500}>500</option>
                </select>
                        </div>
            </div>
            
            <div class="form-group">
                        <label for="question">
                            <i class="fas fa-question"></i>
                            Frage
                        </label>
                        <textarea id="question" name="question" bind:value={formQuestion} required rows="2" placeholder="Die Quizfrage eingeben..."></textarea>
            </div>
            
            <div class="form-group">
                        <label for="answer">
                            <i class="fas fa-check"></i>
                            Antwort
                        </label>
                        <textarea id="answer" name="answer" bind:value={formAnswer} required rows="1" placeholder="Die korrekte Antwort..."></textarea>
            </div>
            
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" on:click={cancelEdit}>
                            <i class="fas fa-times"></i>
                            Abbrechen
                        </button>
                        <button type="submit" class="btn-save">
                            <i class="fas {editingId ? 'fa-save' : 'fa-plus'}"></i>
                            {editingId ? 'Speichern' : 'Erstellen'}
                        </button>
            </div>
        </form>
    </div>
        {/if}

        <div class="questions-list">
            {#each data.questions as q (q.id)}
                <div class="question-card" class:editing={editingId === q.id}>
                    <div class="card-meta">
                        <span class="category-badge">{q.category}</span>
                        <span class="points-badge">
                            <i class="fas fa-star"></i>
                            {q.points}
                        </span>
                    </div>
                    <p class="question-text">{q.question}</p>
                    <p class="answer-text">
                        <i class="fas fa-check-circle"></i>
                        {q.answer}
                    </p>
                    <div class="card-actions">
                        <button class="btn-edit" on:click={() => startEdit(q)} title="Bearbeiten">
                            <i class="fas fa-pen"></i>
                        </button>
                        <form method="POST" action="?/delete" use:enhance>
                            <input type="hidden" name="id" value={q.id} />
                            <button type="submit" class="btn-delete" title="Löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </form>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .questions-page {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, rgba(10, 14, 18, 0.98) 0%, rgba(15, 20, 25, 0.99) 100%);
        border-radius: 10px;
        overflow: hidden;
    }

    /* Header */
    .page-header {
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 1rem;
        background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%);
        border-bottom: 1px solid rgba(212, 175, 55, 0.12);
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .btn-back {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: all 0.2s ease;
        touch-action: manipulation;
    }

    .btn-back:hover {
        background: rgba(212, 175, 55, 0.15);
        border-color: rgba(212, 175, 55, 0.3);
        color: #d4af37;
    }

    .btn-back i {
        font-size: 0.7rem;
    }

    .header-icon {
        color: #d4af37;
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .page-header h1 {
        margin: 0;
        font-family: 'Cinzel', serif;
        font-size: 0.9rem;
        font-weight: 600;
        color: #d4af37;
        letter-spacing: 0.05em;
    }

    .question-count {
        background: rgba(212, 175, 55, 0.15);
        color: #d4af37;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .btn-add {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.9rem;
        background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
        border: 1px solid rgba(45, 90, 61, 0.5);
        border-radius: 6px;
        color: #a8d5a2;
        font-family: 'Lato', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 36px;
        touch-action: manipulation;
    }

    .btn-add:hover {
        background: linear-gradient(135deg, #2d5a3d 0%, #3d7a50 100%);
        transform: translateY(-1px);
    }

    .btn-add i {
        font-size: 0.7rem;
    }

    /* Content Area */
    .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0.5rem;
        gap: 0.5rem;
    }

    /* Form Panel */
    .form-panel {
        flex-shrink: 0;
        background: linear-gradient(180deg, rgba(18, 24, 30, 0.98) 0%, rgba(12, 18, 24, 0.99) 100%);
        border-radius: 8px;
        border: 1px solid rgba(212, 175, 55, 0.2);
        overflow: hidden;
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: rgba(212, 175, 55, 0.08);
        border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }

    .form-header h2 {
        margin: 0;
        font-family: 'Cinzel', serif;
        font-size: 0.75rem;
        font-weight: 600;
        color: #d4af37;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-header h2 i {
        font-size: 0.65rem;
        opacity: 0.8;
    }

    .btn-close {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-close:hover {
        background: rgba(180, 60, 60, 0.2);
        border-color: rgba(180, 60, 60, 0.4);
        color: #e8a0a0;
    }

    .form-panel form {
        padding: 0.75rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem;
    }

    .form-group {
        margin-bottom: 0.5rem;
    }

    .form-group-small {
        width: 100px;
    }

    label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 0.3rem;
        color: rgba(212, 175, 55, 0.8);
        font-family: 'Lato', sans-serif;
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    label i {
        font-size: 0.55rem;
        opacity: 0.7;
    }

    input, select, textarea {
        width: 100%;
        padding: 0.5rem 0.6rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        color: #f5f0e1;
        font-family: 'Lato', sans-serif;
        font-size: 0.8rem;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
    }

    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: rgba(212, 175, 55, 0.5);
    }

    textarea {
        resize: vertical;
        min-height: 50px;
    }

    .form-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        justify-content: flex-end;
    }

    .btn-cancel, .btn-save {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.8rem;
        border-radius: 5px;
        font-family: 'Lato', sans-serif;
        font-size: 0.7rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 34px;
        touch-action: manipulation;
    }

    .btn-cancel {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.6);
    }

    .btn-cancel:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-save {
        background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
        border: 1px solid rgba(45, 90, 61, 0.5);
        color: #a8d5a2;
    }

    .btn-save:hover {
        background: linear-gradient(135deg, #2d5a3d 0%, #3d7a50 100%);
    }

    /* Questions List */
    .questions-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .questions-list::-webkit-scrollbar {
        width: 4px;
    }

    .questions-list::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
    }

    .questions-list::-webkit-scrollbar-thumb {
        background: rgba(212, 175, 55, 0.25);
        border-radius: 2px;
    }

    .question-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: auto auto;
        gap: 0.3rem 0.6rem;
        padding: 0.5rem 0.6rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.04);
        transition: all 0.2s ease;
        align-items: start;
    }

    .question-card:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
    }

    .question-card.editing {
        background: rgba(212, 175, 55, 0.08);
        border-color: rgba(212, 175, 55, 0.3);
    }

    .card-meta {
        grid-column: 1;
        grid-row: 1 / 3;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        align-items: flex-start;
    }

    .category-badge {
        background: rgba(212, 175, 55, 0.12);
        color: #d4af37;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-size: 0.55rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .points-badge {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        color: rgba(212, 175, 55, 0.7);
        font-size: 0.6rem;
        font-weight: 600;
    }

    .points-badge i {
        font-size: 0.5rem;
    }

    .question-text {
        grid-column: 2;
        grid-row: 1;
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.4;
        color: #f5f0e1;
    }

    .answer-text {
        grid-column: 2;
        grid-row: 2;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.65rem;
        color: #a8d5a2;
    }

    .answer-text i {
        font-size: 0.5rem;
        opacity: 0.7;
    }

    .card-actions {
        grid-column: 3;
        grid-row: 1 / 3;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        opacity: 1; /* Immer sichtbar auf Touch */
    }

    .btn-edit, .btn-delete {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.15s ease;
        touch-action: manipulation;
    }

    .btn-edit:hover {
        background: rgba(212, 175, 55, 0.15);
        border-color: rgba(212, 175, 55, 0.3);
        color: #d4af37;
    }

    .btn-delete:hover {
        background: rgba(180, 60, 60, 0.2);
        border-color: rgba(180, 60, 60, 0.4);
        color: #e8a0a0;
    }

    .btn-edit i, .btn-delete i {
        font-size: 0.65rem;
    }

    /* Responsive für kleine Screens */
    @media (max-width: 600px) {
        .form-row {
            grid-template-columns: 1fr;
        }

        .form-group-small {
            width: 100%;
        }

        .question-card {
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto auto;
        }

        .card-meta {
            grid-column: 1;
            grid-row: 1;
            flex-direction: row;
            gap: 0.5rem;
        }

        .question-text {
            grid-column: 1 / 3;
            grid-row: 2;
        }

        .answer-text {
            grid-column: 1 / 3;
            grid-row: 3;
        }

        .card-actions {
            grid-column: 2;
            grid-row: 1;
            flex-direction: row;
        }
    }
</style>
