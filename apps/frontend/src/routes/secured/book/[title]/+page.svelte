<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores'; // For SvelteKit routing context
	import { EpubService } from '$lib/services/epubService';
	import Secured from '$lib/components/Secured.svelte';
	import type { Book } from '$lib/types/book/book';

	let book: Book | null = null;
	let error: string | null = null;
	let loading = true;

	// Extract the book title from the URL
	let title: string = '';

	// Function to format the date
    function formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return 'Unknown date';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid date';

        // Customize the locale and options as needed
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

	// Fetch book details on mount
	onMount(async () => {
		const params = $page.params as { title: string };
		title = decodeURIComponent(params.title);

		try {
			book = await EpubService.getBookByTitle(title);
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An error occurred while fetching book details';
			}
		} finally {
			loading = false;
		}
	});

	// Function to handle EPUB download
	const handleDownload = async () => {
		if (!book) return;
		try {
			await EpubService.downloadBook(title);
		} catch (err) {
			if (err instanceof Error) {
				alert(`Download failed: ${err.message}`);
			} else {
				alert('An unexpected error occurred during download');
			}
		}
	};
</script>

<Secured>
    {#if loading}
        <!-- Loading Indicator -->
        <header class="shadow">
            <div class="w-full px-4 py-6 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900">Loading book details...</h1>
            </div>
        </header>
    {:else}
        <header class="shadow">
            <div class="w-full px-4 py-6 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900">Book</h1>
            </div>
        </header>
        <div class="w-full border-t border-gray-100 bg-white px-4 py-6 sm:px-6 md:flex lg:px-8">
            <div class="divide-y flex justify-center md:w-1/3 md:pe-6 lg:w-2/5 lg:pe-10">
                <div class="h-[710px] aspect-auto overflow-hidden rounded-md">
                    <img
                        src={book?.cover}
                        alt={`Cover of ${book?.title}`}
                        class="max-h-full drop-shadow-md rounded-md m-auto"
                    />
                </div>
            </div>
            <dl class="divide-y divide-gray-100 md:w-2/3 lg:w-3/5">
                <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm/6 font-medium text-gray-900">Title</dt>
                    <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{book?.title}</dd>
                </div>
                <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm/6 font-medium text-gray-900">Author</dt>
                    <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{book?.author}</dd>
                </div>
                <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm/6 font-medium text-gray-900">Publisher</dt>
                    <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {book?.publisher}
                    </dd>
                </div>
                <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm/6 font-medium text-gray-900">Publication Date</dt>
                    <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {formatDate(book?.date)}
                    </dd>
                </div>
                <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm/6 font-medium text-gray-900">Description</dt>
                    <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {@html book?.description}
                    </dd>
                </div>
                <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm/6 font-medium text-gray-900">Attachments</dt>
                    <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200">
                            <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                                <div class="flex w-0 flex-1 items-center">
                                    <i class="fa-solid fa-book-bookmark fa-xl text-gray-400"></i>
                                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span class="truncate font-medium">{title}</span>
                                    </div>
                                </div>
                                <div class="ml-4 shrink-0">
                                    <a
                                        href="/secured/book/{encodeURIComponent(title)}/read"
                                        class="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Read
                                    </a>
                                </div>
                            </li>
                            <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                                <div class="flex w-0 flex-1 items-center">
                                    <i class="fa-solid fa-paperclip fa-xl text-gray-400"></i>
                                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span class="truncate font-medium">{title}.epub</span>
                                        <span class="shrink-0 text-gray-400">2.4mb</span>
                                    </div>
                                </div>
                                <div class="ml-4 shrink-0">
                                    <a
                                        href="/secured/book/{encodeURIComponent(title)}"
                                        on:click|preventDefault={() => handleDownload()}
                                        class="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Download
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </dd>
                </div>
            </dl>
        </div>
    {/if}
</Secured>
