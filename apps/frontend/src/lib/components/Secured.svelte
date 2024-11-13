<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';

    onMount(() => {
        if (!localStorage.getItem('authToken')) {
            window.location.href = '/auth/signin';
        }
    });
</script>

<Header/>
<slot />
