<script lang="ts">
    import { handleLogin } from "$lib/services/authenticationService";

    let email: string = '';
    let password: string = '';
    let error: string = '';

    async function onSubmit() {
        error = '';
        try {
            await handleLogin(email, password);
        } catch (err: unknown) {
            // Check if err is an Error object
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'An unknown error occurred';
            }
        }
    }
</script>

<main>
    <h1>Login</h1>
    <form on:submit|preventDefault={onSubmit}>
        <input type="email" placeholder="Email" bind:value={email} required />
        <input type="password" placeholder="Password" bind:value={password} required />
        <button type="submit">Login</button>
    </form>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</main>

<style>
.error {
    color: red;
}
</style>
