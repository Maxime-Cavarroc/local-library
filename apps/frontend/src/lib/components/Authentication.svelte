<script lang="ts">
	import { getAuthToken } from "$lib/services/authenticationService";
	import { onMount } from "svelte";

	onMount(async () => {
        if (await getAuthToken()) {
            window.location.href = '/secured/dashboard';
        }
    });
</script>

<slot />