<!-- src/routes/epub-reader/[title].svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { EpubService } from '$lib/services/epubService';
	import Secured from '$lib/components/Secured.svelte';
	import ePub, { type Location } from 'epubjs';

	let error: string | null = null;
	let loading = true;
	let fullscreen = false;
	let rendition: any; // EPUB.js Rendition instance
	let toc: Array<{ label: string; href: string }> = [];

	// Page Tracking Variable
	let progress = 0; // Percentage

	// Extract the book title from the URL
	let title: string = '';

	onMount(async () => {
		const params = $page.params as { title: string };
		title = decodeURIComponent(params.title);
		if (title) {
			await initializeEpubReader(title);
		}
	});

	onMount(() => {
		// Safely add event listeners
		window.addEventListener('keydown', handleKeyDown);
		document.addEventListener('fullscreenchange', handleFullscreenChange);

		return () => {
			// Clean up listeners on component destroy
			window.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	});

	async function initializeEpubReader(bookTitle: string) {
		try {
			const epubBlob = await EpubService.readBook(bookTitle);
			const readerContainer = document.getElementById('reader-container');

			if (!readerContainer) {
				throw new Error('Reader container not found');
			}

			// Read Blob as ArrayBuffer
			const arrayBuffer = await epubBlob.arrayBuffer();
			const reader = ePub(arrayBuffer);

			rendition = reader.renderTo('reader-container', {
				width: '100%',
				height: '100%',
				spread: 'always',
				allowScriptedContent: true
			});

			// Fetch Table of Contents
			rendition.on('rendered', () => {
				const navigation = reader.navigation;
				toc = navigation.toc;
			});

			// Listen to events for progress tracking using percentageFromCfi
			rendition.on('relocated', (location: Location) => {
				if (location && location.start && reader.locations) {
					const cfi = location.start.cfi;
					const percentage = reader.locations.percentageFromCfi(cfi);
					progress = Math.min(Math.round(percentage * 100), 100);
				}
			});

			// Now display the rendition
			await rendition.display();
			await reader.locations.generate(100);

			loading = false;
		} catch (err) {
			if (err instanceof Error) {
				error = `Failed to load EPUB: ${err.message}`;
			} else {
				error = 'An unexpected error occurred while loading the EPUB';
			}
			console.error(error);
			loading = false;
		}
	}

	// Navigation Functions
	function goNext() {
		if (rendition) {
			rendition.next();
		} else {
			console.error('Rendition is not initialized');
		}
	}

	function goPrev() {
		if (rendition) {
			rendition.prev();
		} else {
			console.error('Rendition is not initialized');
		}
	}

	function goTo(location: string) {
		if (rendition) {
			rendition.display(location);
		}
	}

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
			});
		} else {
			document.exitFullscreen().catch((err) => {
				console.error(`Error attempting to exit fullscreen mode: ${err.message} (${err.name})`);
			});
		}
	}

	// Handle TOC Click
	function handleTocClick(href: string) {
		rendition.display(href);
	}

	// Keyboard Event Handler
	function handleKeyDown(event: KeyboardEvent) {
		// Normalize key detection
		const key = event.key || '';
		const keyCode = event.keyCode || event.which;

		switch (true) {
			case key === 'ArrowRight':
				event.preventDefault(); // Prevent default scrolling behavior
				goNext();
				break;
			case key === 'ArrowLeft':
				event.preventDefault(); // Prevent default scrolling behavior
				goPrev();
				break;
			case key === 'Escape':
				event.preventDefault();
				if (fullscreen) {
					toggleFullscreen();
				}
				break;
			case key === 'F11' || keyCode === 122:
				event.preventDefault();
				toggleFullscreen();
				break;
			default:
				break;
		}
	}

	// Fullscreen Change Event Handler
	function handleFullscreenChange() {
		fullscreen = !!document.fullscreenElement;
	}

	onDestroy(() => {
		if (rendition) {
			rendition.destroy();
		}
	});
</script>

<Secured>
	{#if !fullscreen}
		<header class="flex items-center justify-between shadow">
			<!-- Left: Book Title -->
			<div class="px-4 py-6 sm:px-6 lg:px-8">
				<h1 class="text-3xl font-bold tracking-tight text-gray-900">{title || 'Loading...'}</h1>
			</div>

			<!-- Center: Page Tracking -->
			<div class="flex h-6 w-1/3 rounded items-center bg-gray-200 dark:bg-gray-700">
				<div
					class="flex h-6 items-center justify-center rounded bg-blue-600 text-center text-xs font-medium text-blue-100 dark:bg-blue-500"
					style="width: {progress}%"
				>
					{progress}%
				</div>
			</div>

			<!-- Right: Navigation Controls -->
			<div class="flex space-x-2 px-4 py-6 sm:px-6 lg:px-8">
				<button
					on:click={goPrev}
					class="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
				>
					Previous
				</button>
				<button
					on:click={goNext}
					class="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
				>
					Next
				</button>
				<button
					on:click={toggleFullscreen}
					class="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
				>
					Fullscreen
				</button>
			</div>
		</header>
	{/if}
	<div class="flex h-screen flex-1">
		<!-- Table of Contents Sidebar -->
		{#if toc.length > 0 && !fullscreen}
			<aside class="w-1/4 overflow-y-auto bg-gray-100 p-4">
				<h2 class="mb-4 text-xl font-semibold">Table of Contents</h2>
				<ul>
					{#each toc as item}
						<li class="mb-2">
							<a
								href="#"
								on:click|preventDefault={() => handleTocClick(item.href)}
								class="text-indigo-600 hover:text-indigo-500"
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</aside>
		{/if}
		<!-- EPUB Reader Container -->
		<main class="flex-1 overflow-auto" id="reader-container"></main>
	</div>
</Secured>

<style>
	/* Optional: Customize the EPUB reader container */
	#reader-container {
		/* For better readability */
		background-color: #fdfdfd;
	}

	/* TOC Styling */
	aside {
		border-right: 1px solid #e5e7eb;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		aside {
			display: none; /* Hide TOC on small screens */
		}
	}
</style>
