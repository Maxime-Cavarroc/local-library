<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';
	import { getAuthToken } from '$lib/services/authenticationService';

    onMount(async () => {
        if (!await getAuthToken()) {
            window.location.href = '/auth/signin';
        }
    });
</script>

<Header/>
<slot />
