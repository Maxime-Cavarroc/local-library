<script lang="ts">
	import { onMount } from "svelte";

	onMount(() => {
        if (localStorage.getItem('authToken')) {
            window.location.href = '/secured/dashboard';
        }
    });
</script>

<slot />