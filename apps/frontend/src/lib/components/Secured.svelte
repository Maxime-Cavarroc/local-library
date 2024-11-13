<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';

    onMount(() => {
        if (!localStorage.getItem('authToken')) {
            window.location.href = '/auth/login';
        }
    });
</script>

<Header/>
<slot />
