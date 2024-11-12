<script lang="ts">
    import { currentUser, logout } from "../../../lib/stores/authentication"; 

    $: if (!$currentUser) {
        window.location.href = '/login';
    }

    function handleLogout(): void {
        logout();
        window.location.href = '/login';
    }
</script>

<main>
    <h1>Welcome, {$currentUser?.email}</h1>
    <button on:click={handleLogout}>Logout</button>
</main>