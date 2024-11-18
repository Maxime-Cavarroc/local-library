<!-- src/routes/epub-reader/[title].svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { EpubService } from '$lib/services/epubService';
    import Secured from '$lib/components/Secured.svelte';
    import ePub from 'epubjs';

    let book: { title: string; author: string; description: string; cover: string | null } | null = null;
    let error: string | null = null;
    let loading = true;
    let rendition: any; // EPUB.js Rendition instance
    let toc: Array<{ label: string; href: string }> = [];

    // Extract the book title from the URL
    let title: string = '';

    onMount(async () => {
        const params = $page.params as { title: string };
        title = decodeURIComponent(params.title);

        if (title) {
            await initializeEpubReader(title);
        }

        // Attach keyboard event listeners
        window.addEventListener('keydown', handleKeyDown);
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
            });

            rendition.display();

            // Fetch Table of Contents
            rendition.on('rendered', () => {
                const navigation = rendition.getNavigation();
                toc = navigation.toc;
            });

            // Optionally, listen to events for progress tracking
            rendition.on('relocated', (location: any) => {
                // Example: Update current location or progress
                console.log('Current Location:', location.start.cfi);
            });

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
        }
    }

    function goPrev() {
        if (rendition) {
            rendition.prev();
        }
    }

    function goTo(location: string) {
        if (rendition) {
            rendition.display(location);
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Handle TOC Click
    function handleTocClick(href: string) {
        rendition.display(href);
    }

    // Keyboard Event Handler
    function handleKeyDown(event: KeyboardEvent) {
        // Check if focus is on an input or editable element to avoid conflicts
        const tagName = (event.target as HTMLElement).tagName.toLowerCase();
        const isEditable = (event.target as HTMLElement).isContentEditable;

        if (tagName === 'input' || tagName === 'textarea' || isEditable) {
            return; // Do not handle key events if typing in input fields
        }

        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault(); // Prevent default scrolling behavior
                goNext();
                break;
            case 'ArrowLeft':
                event.preventDefault(); // Prevent default scrolling behavior
                goPrev();
                break;
            default:
                break;
        }
    }

    onDestroy(() => {
        if (rendition) {
            rendition.destroy();
        }
        // Remove keyboard event listeners
        window.removeEventListener('keydown', handleKeyDown);
    });
</script>

<Secured>
    <header class="shadow flex items-center justify-between">
        <div class="w-full px-4 py-6 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">{title || 'Loading...'}</h1>
        </div>
        <!-- Navigation Controls -->
        <div class="flex space-x-2 px-4 py-6 sm:px-6 lg:px-8">
            <button on:click={goPrev} class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Previous
            </button>
            <button on:click={goNext} class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Next
            </button>
            <button on:click={toggleFullscreen} class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Fullscreen
            </button>
        </div>
    </header>
    <div class="flex flex-1 h-screen">
        <!-- Table of Contents Sidebar -->
        {#if toc.length > 0}
            <aside class="w-1/4 bg-gray-100 p-4 overflow-y-auto">
                <h2 class="text-xl font-semibold mb-4">Table of Contents</h2>
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
