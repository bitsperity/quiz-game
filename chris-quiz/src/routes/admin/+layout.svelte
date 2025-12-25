<script lang="ts">
</script>

<div class="admin-layout">
        <slot />
</div>

<style>
    .admin-layout {
        height: 100vh;
        height: 100dvh;
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        overflow: hidden;
        box-sizing: border-box;
        background: #0a0e12;
    }
</style>
