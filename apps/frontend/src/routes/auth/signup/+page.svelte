<script lang="ts">
	import Authentication from '$lib/components/Authentication.svelte';
	import { handleSignup } from '$lib/services/authenticationService';

	let email: string = '';
	let password: string = '';
    let passwordConfirmation: string = '';
	let error: string = '';

	async function onSubmit() {
		error = '';
		try {
			await handleSignup(email, password, passwordConfirmation);
            window.location.href = '/auth/signin';
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

<Authentication>
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center">
            <i class="fa-solid fa-book fa-2xl mx-auto"></i>
            <h2 class="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                Sign up to your account
            </h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" on:submit|preventDefault={onSubmit}>
                <div>
                    <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
                    <div class="mt-2">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            bind:value={email} 
                        />
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm/6 font-medium text-gray-900">
                            Password
                        </label>
                    </div>
                    <div class="mt-2">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            bind:value={password}
                        />
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm/6 font-medium text-gray-900">
                            Password confirmation
                        </label>
                    </div>
                    <div class="mt-2">
                        <input
                            id="password-confirmation"
                            name="password-confirmation"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            bind:value={passwordConfirmation}
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >Sign up
                    </button>
                </div>
                {#if error}
                    <p class="text-red-600">{error}</p>
                {/if}
            </form>
            <p class="mt-10 text-center text-sm/6 text-gray-500">
                Already a member?
                <a href="/auth/signin" class="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</a>
            </p>
        </div>
    </div>
</Authentication>
