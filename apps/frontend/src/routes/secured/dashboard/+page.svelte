<!-- src/routes/secured/Dashboard.svelte -->
<script lang="ts">
	import { LlamaService } from '$lib/services/llamaService';
    import Secured from '../../../lib/components/Secured.svelte';

	let error: string | null = null;
    let prompt = ''; // Input field value
    let result = ''; // Model response
    let isLoading = false; // Loader for the request

    async function sendPrompt() {
        if (!prompt.trim()) {
            result = 'Please enter a prompt.';
            return;
        }

        isLoading = true;
        result = ''; // Clear previous result

        try {
            const response = await LlamaService.sendPrompt(prompt);
            result = response.result; // Response from the service
        } catch (err) {
			if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'Failed to fetch response from the Llama model.';
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<Secured>
    <header class="shadow">
        <div class="flex w-full items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
            <!-- Dashboard Title -->
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
    </header>

    <main class="p-4">
        <div class="mb-4">
            <label for="prompt" class="block text-sm font-medium text-gray-700">Enter your prompt:</label>
            <input
                id="prompt"
                type="text"
                bind:value={prompt}
                placeholder="e.g., Translate 'Hello' to French."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
        </div>

        <button
            on:click={sendPrompt}
            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={isLoading}
        >
            {isLoading ? 'Sending...' : 'Send'}
        </button>

        <div class="mt-4">
            <h2 class="text-lg font-bold">Response:</h2>
            <p class="mt-2 whitespace-pre-wrap text-gray-700">{result || 'No response yet.'}</p>
        </div>
    </main>
</Secured>
