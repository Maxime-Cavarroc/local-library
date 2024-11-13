<script lang="ts">
    import { currentUser, logout } from "../../../lib/stores/authentication"; 
	import Secured from "../Secured.svelte";

    function handleLogout(): void {
        logout();
        window.location.href = '/auth/login';
    }
</script>

<Secured>
    <h1>Welcome, {$currentUser?.email}</h1>
    <button on:click={handleLogout}>Logout</button>
</Secured>