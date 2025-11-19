<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="admin-layout">
    <nav class="glass-panel">
        <h1>Admin Control</h1>
        <div class="links">
            <a href="/admin" class:active={$page.url.pathname === '/admin'}>Dashboard</a>
            <a href="/admin/questions" class:active={$page.url.pathname.startsWith('/admin/questions')}>Questions</a>
        </div>
    </nav>

    <div class="content">
        <slot />
    </div>
</div>

<style>
    .admin-layout {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        margin-bottom: 2rem;
    }

    h1 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--color-secondary);
    }

    .links {
        display: flex;
        gap: 1rem;
    }

    a {
        color: var(--color-text);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: background 0.2s;
    }

    a:hover, a.active {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-secondary);
    }
</style>
