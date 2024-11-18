import EPub from 'epub';
import fs from 'fs/promises';
import path from 'path';
import { Book } from '../types/book';

const EPUB_DIR = path.join(__dirname, '../../../../../epubs');

/**
 * Parses an EPUB file and extracts book metadata and cover.
 * @param filePath - The path to the EPUB file.
 * @returns A promise that resolves to a Book object.
 */
export async function parseEpub(filePath: string): Promise<Book> {
    return new Promise<Book>((resolve, reject) => {
        const epub = new EPub(filePath);
        epub.parse();

        epub.on('error', (err) => {
            reject(err);
        });

        epub.on('end', async () => {
            try {
                const fileName = path.basename(filePath, '.epub');
                const title = epub.metadata.title || fileName;
                const author = epub.metadata.creator || 'Unknown Author';
                const description = epub.metadata.description || 'No description available';
                const date = epub.metadata.date || null;
                const publisher = epub.metadata.publisher || null;
                const language = epub.metadata.language || null;
                const tag = epub.metadata.subject || null;
                const cover = await extractCover(epub);

                resolve({ fileName, title, author, description, cover, date, publisher, language, tag });
            } catch (err) {
                reject(err);
            }
        });
    });
}

/**
 * Extracts the cover image from an EPUB file as a Base64 Data URL.
 * @param epub - The parsed EPUB instance.
 * @returns A promise that resolves to a Base64 Data URL string or null if no cover is found.
 */
async function extractCover(epub: EPub): Promise<string | null> {
    let coverItems: any[] = [];

    if (epub.metadata.cover) {
        coverItems = Object.values(epub.manifest).filter(
            (item) => item.id === epub.metadata.cover
        );
    }

    if (coverItems.length !== 1) {
        coverItems = Object.values(epub.manifest).filter(
            (item) =>
                item['media-type'].startsWith('image/') &&
                item.properties === 'cover-image'
        );
    }

    if (coverItems.length !== 1) {
        coverItems = Object.values(epub.manifest).filter(
            (item) =>
                item['media-type'].startsWith('image/') &&
                !['x40k', 'title', 'icon', 'extract', 'part', 'map', '-fr-'].some((keyword) =>
                    item.id.toLowerCase().includes(keyword)
                ) &&
                item.id.toLowerCase().includes('cover')
        );
    }

    if (coverItems.length === 0) {
        coverItems = Object.values(epub.manifest).filter(
            (item) =>
                item['media-type'].startsWith('image/') &&
                !['x40k', 'title', 'icon', 'extract', 'part', 'map', '-fr-'].some((keyword) =>
                    item.id.toLowerCase().includes(keyword)
                )
        );
    }

    if (coverItems.length > 0) {
        const longestCoverItem = coverItems.reduce((longest, current) =>
            current.id.length > longest.id.length ? current : longest
            , coverItems[0]);

        return new Promise<string | null>((resolve) => {
            epub.getImage(longestCoverItem.id, (err, data, mimeType) => {
                if (err) {
                    console.warn(`Failed to get cover image: ${err.message}`);
                    resolve(null);
                } else {
                    const coverBase64 = data.toString('base64');
                    const coverDataUrl = `data:${mimeType};base64,${coverBase64}`;
                    resolve(coverDataUrl);
                }
            });
        });
    }

    console.warn(`No cover image found for ${path.basename(epub.metadata.title, '.epub')}`);
    return null;
}

/**
 * Retrieves all EPUB files in the EPUB directory asynchronously.
 * @returns A promise that resolves to an array of EPUB file paths.
 */
export async function getAllEpubFiles(): Promise<string[]> {
    const files = await fs.readdir(EPUB_DIR);
    return files
        .filter((file) => file.endsWith('.epub'))
        .map((file) => path.join(EPUB_DIR, file));
}

/**
 * Finds an EPUB file by its title (case-insensitive).
 * @param title - The title of the book.
 * @returns The path to the EPUB file or null if not found.
 */
export async function findEpubByTitle(title: string): Promise<string | null> {
    const sanitizedTitle = title.toLowerCase();
    const epubFiles = await getAllEpubFiles();

    const matchedFile = epubFiles.find(
        (file) => path.basename(file, '.epub').toLowerCase() === sanitizedTitle
    );

    return matchedFile || null;
}

/**
 * Sorts an array of Book objects based on the specified field and order.
 * @param books - The array of Book objects to sort.
 * @param sortField - The field to sort by (e.g., 'title', 'author', 'date', 'publisher', 'language').
 * @param sortOrder - The order of sorting ('asc' for ascending, 'desc' for descending).
 * @returns A new array of sorted Book objects.
 */
export function sortBooks(books: Book[], sortField: keyof Book, sortOrder: 'asc' | 'desc'): Book[] {
    return books.sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];

        // Handle null or undefined values
        if (fieldA === null || fieldA === undefined) return 1;
        if (fieldB === null || fieldB === undefined) return -1;

        // Compare as strings
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            const comparison = fieldA.localeCompare(fieldB, undefined, { sensitivity: 'base' });
            return sortOrder === 'asc' ? comparison : -comparison;
        }

        // Compare as dates
        if (sortField === 'date') {
            const dateA = new Date(fieldA as string);
            const dateB = new Date(fieldB as string);
            return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }

        // Fallback to 0 if types are not comparable
        return 0;
    });
}
