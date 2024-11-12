<script lang="ts">
    import { onMount } from 'svelte';
    import { authToken } from '../../lib/stores/authentication';
    
    let isAuthenticated = false;

    // Check authentication status
    $: authToken.subscribe((token) => {
        isAuthenticated = !!token;
    });

    onMount(() => {
        if (!isAuthenticated) {
            window.location.href = '/login'; // Redirect to login if not authenticated
        }
    });
</script>

<slot />
