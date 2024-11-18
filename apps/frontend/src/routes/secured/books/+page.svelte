<!-- src/routes/secured/Books.svelte -->
<script lang="ts">
	import type { Book } from '$lib/types/book/book';
	import { EpubService } from '$lib/services/epubService';
	import type { PaginatedBooks } from '$lib/types/book/paginatedBook';
	import Secured from '../../../lib/components/Secured.svelte';
	import { onMount, onDestroy } from 'svelte';

	let books: Book[] = [];
	let error: string | null = null;
	let currentPage: number = 1;
	const limit: number = 18; // Number of items per page
	let sort: 'fileName' | 'title' | 'author' | 'date' | 'publisher' | 'language' = 'fileName';
	let order: 'asc' | 'desc' = 'asc';
    let totalItems: number = 0;
	let totalPages: number = 1;
	let isLoading: boolean = false;
	let observer: IntersectionObserver;
	let sentinel: HTMLElement;

	// Function to fetch books
	async function fetchBooks() {
		if (isLoading || currentPage > totalPages) return; // Prevent multiple requests
		isLoading = true;
		try {
			const paginatedBooks: PaginatedBooks = await EpubService.getPaginatedEpubs(
				currentPage,
				limit,
				sort,
				order
			);
			books = [...books, ...paginatedBooks.books];
            totalItems = paginatedBooks.totalItems;
			totalPages = paginatedBooks.totalPages;
			currentPage += 1;
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An error occurred while fetching EPUB covers';
			}
		} finally {
			isLoading = false;
		}
	}

	// Intersection Observer callback
	function handleIntersect(entries: IntersectionObserverEntry[]) {
		if (entries[0].isIntersecting) {
			fetchBooks();
		}
	}

	onMount(() => {
		fetchBooks(); // Initial fetch

		// Initialize IntersectionObserver
		observer = new IntersectionObserver(handleIntersect, {
			root: null,
			rootMargin: '0px',
			threshold: 1.0
		});

		if (sentinel) {
			observer.observe(sentinel);
		}
	});

	onDestroy(() => {
		if (observer && sentinel) {
			observer.unobserve(sentinel);
		}
	});

	// Handlers for sorting changes
	async function handleSortChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		sort = select.value as 'fileName' | 'title' | 'author' | 'date' | 'publisher' | 'language';
		resetAndFetch();
	}

	async function handleOrderChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		order = select.value as 'asc' | 'desc';
		resetAndFetch();
	}

	// Reset pagination and fetch data
	async function resetAndFetch() {
		books = [];
		currentPage = 1;
		totalPages = 1;
		error = null;
		await fetchBooks();
	}
</script>

<Secured>
	<header class="shadow">
		<div class="flex w-full items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
			<!-- Books Title -->
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Books ({totalItems})</h1>

			<!-- Sorting Controls -->
			<div class="flex space-x-4">
				<!-- Sort By Dropdown -->
				<div class="flex flex-col">
					<select
						id="sort"
						bind:value={sort}
						on:change={handleSortChange}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
					>
						<option value="fileName">File Name</option>
						<option value="title">Title</option>
						<option value="author">Author</option>
						<option value="date">Publication Date</option>
						<option value="publisher">Publisher</option>
						<option value="language">Language</option>
					</select>
				</div>

				<!-- Order Dropdown -->
				<div class="flex flex-col">
					<select
						id="order"
						bind:value={order}
						on:change={handleOrderChange}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
					>
						<option value="asc">Ascending</option>
						<option value="desc">Descending</option>
					</select>
				</div>
			</div>
		</div>
	</header>
	<div class="border-t border-gray-100">
		<div class="w-full px-4 py-4 sm:px-6 lg:px-8">
			{#if error}
				<p class="font-bold text-red-500">{error}</p>
			{:else}
				<!-- Books Grid -->
				<div
					class="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8"
				>
					{#each books as book (book.title)}
						<div class="group relative">
							<div
								class="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75"
							>
								{#if book.cover}
									<img
										src={book.cover}
										alt={`Cover of ${book.title}`}
										class="size-full object-cover object-center lg:size-full"
									/>
								{:else}
									<div class="flex h-full items-center justify-center text-gray-500">
										No Cover Available
									</div>
								{/if}
							</div>
							<div class="mt-4 flex justify-between">
								<div class="w-5/6">
									<h3 class="text-sm text-gray-700">
										<a href="/secured/book/{encodeURIComponent(book.fileName)}">
											<span aria-hidden="true" class="absolute inset-0"></span>
											{book.title}
										</a>
									</h3>
									<p class="mt-1 text-sm text-gray-500">{book.publisher}</p>
								</div>
								<p class="text-sm font-medium text-gray-900">{book.language}</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Loading Indicator -->
				{#if isLoading}
					<div class="mt-4 flex justify-center">
						<svg
							class="h-8 w-8 animate-spin text-indigo-600"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
						</svg>
					</div>
				{/if}

				<!-- Sentinel Element for IntersectionObserver -->
				<div bind:this={sentinel}></div>
			{/if}
		</div>
	</div>
</Secured>
