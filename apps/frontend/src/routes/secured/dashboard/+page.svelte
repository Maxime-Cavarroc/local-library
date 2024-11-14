<script lang="ts">
	import Secured from '../../../lib/components/Secured.svelte';
	import { onMount } from 'svelte';
    import { EpubService } from '$lib/services/epubService';

    let covers: Array<{ title: string; cover: string }> = [];
    let error: string | null = null;

    onMount(async () => {
        try {
            covers = await EpubService.getCovers();
        } catch (err) {
			// Check if err is an Error object
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An error occurred while fetching EPUB covers';
			}
        }
    });
</script>

<Secured>
	<div class="bg-white">
		<div class="w-full px-4 py-4 sm:px-6 lg:px-8">
			{#if error}
				<p class="text-red-500 font-bold">{error}</p>
			{:else}
				<div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8">
					{#each covers as cover (cover.title)}
						<div class="group relative">
							<div class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
								<img
									src={cover.cover}
									alt={`Cover of ${cover.title}`}
									class="size-full object-cover object-center lg:size-full"
								/>
							</div>
							<div class="mt-4 flex justify-between">
								<div>
									<h3 class="text-sm text-gray-700">
										<a href="#">
											<span aria-hidden="true" class="absolute inset-0"></span>
											{cover.title}
										</a>
									</h3>
									<p class="mt-1 text-sm text-gray-500">Black</p>
								</div>
								<p class="text-sm font-medium text-gray-900">$35</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</Secured>
