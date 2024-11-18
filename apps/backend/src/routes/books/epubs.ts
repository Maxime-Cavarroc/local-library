import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import EPub from 'epub';

export default async function epubRoutes(app: FastifyInstance) {
    const EPUB_DIR = path.join(__dirname, '../../../../../../epubs'); // Adjust directory path as needed

    /**
     * Serve EPUB Covers (Authenticated)
     */
    app.get(
        '/epubs/covers',
        {
            preHandler: app.authenticate, // Authentication middleware
            schema: {
                tags: ['EPUB'],
                description: 'Get covers of all EPUB files in the directory (Authenticated)',
                security: [{ Bearer: [] }],
                response: {
                    200: {
                        description: 'Covers fetched successfully',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                fileName: { type: 'string' },
                                title: { type: 'string' },
                                cover: { type: ['string', 'null'] }, // Base64 Data URL or null
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    500: {
                        description: 'Server error',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                // Read all EPUB files in the directory
                const epubFiles = fs
                    .readdirSync(EPUB_DIR)
                    .filter(file => file.endsWith('.epub'));

                const covers = [];

                for (const file of epubFiles) {
                    const filePath = path.join(EPUB_DIR, file);
                    const epub = new EPub(filePath);

                    // Wrap events in a Promise to use async/await
                    await new Promise<void>((resolve, reject) => {
                        epub.on('end', resolve);
                        epub.on('error', reject);
                        epub.parse();
                    });

                    const fileName = path.basename(file, '.epub');
                    const title = epub.metadata.title || path.basename(file, '.epub');
                    let cover: string | null = null;

                    let coverItems: any[] = [];

                    if (epub.metadata.cover) {
                        coverItems = Object.values(epub.manifest).filter(item =>
                            item.id == epub.metadata.cover
                        );
                    }

                    if (coverItems.length != 1) {
                        // Filter for image items
                        coverItems = Object.values(epub.manifest).filter(item =>
                            item['media-type'].startsWith('image/') &&
                            item.properties === 'cover-image'
                        );
                    }

                    if (coverItems.length != 1) {
                        coverItems = Object.values(epub.manifest).filter(item =>
                            item['media-type'].startsWith('image/') &&
                            !item.id.toLowerCase().includes('x40k') &&
                            !item.id.toLowerCase().includes('title') &&
                            !item.id.toLowerCase().includes('icon') &&
                            !item.id.toLowerCase().includes('extract') &&
                            !item.id.toLowerCase().includes('part') &&
                            !item.id.toLowerCase().includes('map') &&
                            !item.id.toLowerCase().includes('-fr-') &&
                            item.id.toLowerCase().includes('cover')
                        );
                    }

                    if (coverItems.length == 0) {
                        coverItems = Object.values(epub.manifest).filter(item =>
                            item['media-type'].startsWith('image/') &&
                            !item.id.toLowerCase().includes('x40k') &&
                            !item.id.toLowerCase().includes('title') &&
                            !item.id.toLowerCase().includes('icon') &&
                            !item.id.toLowerCase().includes('extract') &&
                            !item.id.toLowerCase().includes('part') &&
                            !item.id.toLowerCase().includes('map') &&
                            !item.id.toLowerCase().includes('-fr-')
                        );
                    }


                    if (coverItems.length > 0) {
                        const longestCoverItem = coverItems.reduce((longest, current) => {
                            return current.id.length > longest.id.length ? current : longest;
                        }, coverItems[0]);

                        cover = await new Promise<string | null>((resolve, reject) => {
                            epub.getImage(longestCoverItem.id, (err, data, mimeType) => {
                                if (err) {
                                    app.log.warn(`Failed to get cover image for ${file}: ${err.message}`);
                                    resolve(null);
                                } else {
                                    const coverBase64 = data.toString('base64');
                                    const coverDataUrl = `data:${mimeType};base64,${coverBase64}`;
                                    resolve(coverDataUrl);
                                }
                            });
                        });
                    } else {
                        app.log.warn(`No cover image found for ${file}`);
                    }

                    covers.push({ fileName, title, cover });
                }

                return reply.send(covers);
            } catch (error) {
                app.log.error(error);
                console.log(error)
                return reply.status(500).send({ error: 'Failed to process EPUB files' });
            }
        }
    );

    /**
 * Get a specific EPUB book by title (Authenticated)
 */
    app.get(
        '/epubs/:title',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['EPUB'],
                description: 'Get details of a specific EPUB file by title (Authenticated)',
                security: [{ Bearer: [] }],
                params: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                    },
                    required: ['title'],
                },
                response: {
                    200: {
                        description: 'Book details fetched successfully',
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            author: { type: 'string' },
                            description: { type: 'string' },
                            cover: { type: ['string', 'null'] }, // Base64 Data URL or null
                        },
                    },
                    404: {
                        description: 'Book not found',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    500: {
                        description: 'Server error',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { title } = request.params as { title: string };
            const sanitizedTitle = title.toLowerCase(); // Ensure case-insensitive matching

            try {
                const epubFiles = fs
                    .readdirSync(EPUB_DIR)
                    .filter(file => file.endsWith('.epub'));

                const matchedFile = epubFiles.find(file =>
                    path.basename(file, '.epub').toLowerCase() === sanitizedTitle
                );

                if (!matchedFile) {
                    return reply.status(404).send({ error: 'Book not found' });
                }

                const filePath = path.join(EPUB_DIR, matchedFile);
                const epub = new EPub(filePath);

                await new Promise<void>((resolve, reject) => {
                    epub.on('end', resolve);
                    epub.on('error', reject);
                    epub.parse();
                });

                const metadata = {
                    title: epub.metadata.title || path.basename(matchedFile, '.epub'),
                    author: epub.metadata.creator || 'Unknown Author',
                    description: epub.metadata.description || 'No description available',
                };

                let cover: string | null = null;

                let coverItems: any[] = [];

                if (epub.metadata.cover) {
                    coverItems = Object.values(epub.manifest).filter(item =>
                        item.id == epub.metadata.cover
                    );
                }

                if (coverItems.length != 1) {
                    // Filter for image items
                    coverItems = Object.values(epub.manifest).filter(item =>
                        item['media-type'].startsWith('image/') &&
                        item.properties === 'cover-image'
                    );
                }

                if (coverItems.length != 1) {
                    coverItems = Object.values(epub.manifest).filter(item =>
                        item['media-type'].startsWith('image/') &&
                        !item.id.toLowerCase().includes('x40k') &&
                        !item.id.toLowerCase().includes('title') &&
                        !item.id.toLowerCase().includes('icon') &&
                        !item.id.toLowerCase().includes('extract') &&
                        !item.id.toLowerCase().includes('part') &&
                        !item.id.toLowerCase().includes('map') &&
                        !item.id.toLowerCase().includes('-fr-') &&
                        item.id.toLowerCase().includes('cover')
                    );
                }

                if (coverItems.length == 0) {
                    coverItems = Object.values(epub.manifest).filter(item =>
                        item['media-type'].startsWith('image/') &&
                        !item.id.toLowerCase().includes('x40k') &&
                        !item.id.toLowerCase().includes('title') &&
                        !item.id.toLowerCase().includes('icon') &&
                        !item.id.toLowerCase().includes('extract') &&
                        !item.id.toLowerCase().includes('part') &&
                        !item.id.toLowerCase().includes('map') &&
                        !item.id.toLowerCase().includes('-fr-')
                    );
                }

                if (coverItems.length > 0) {
                    const longestCoverItem = coverItems.reduce((longest, current) => {
                        return current.id.length > longest.id.length ? current : longest;
                    }, coverItems[0]);

                    cover = await new Promise<string | null>((resolve, reject) => {
                        epub.getImage(longestCoverItem.id, (err, data, mimeType) => {
                            if (err) {
                                app.log.warn(`Failed to get cover image for ${matchedFile}: ${err.message}`);
                                resolve(null);
                            } else {
                                const coverBase64 = data.toString('base64');
                                const coverDataUrl = `data:${mimeType};base64,${coverBase64}`;
                                resolve(coverDataUrl);
                            }
                        });
                    });
                } else {
                    app.log.warn(`No cover image found for ${matchedFile}`);
                }

                return reply.send({ ...metadata, cover });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to fetch book details' });
            }
        }
    );

    /**
   * Download a specific EPUB file by title (Authenticated)
   */
    app.get(
        '/epubs/:title/download',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['EPUB'],
                description: 'Download a specific EPUB file by title (Authenticated)',
                security: [{ Bearer: [] }],
                params: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                    },
                    required: ['title'],
                },
                response: {
                    200: {
                        description: 'EPUB file downloaded successfully',
                        type: 'string',
                        format: 'binary',
                    },
                    404: {
                        description: 'Book not found',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    500: {
                        description: 'Server error',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { title } = request.params as { title: string };
            const sanitizedTitle = title.toLowerCase();

            try {
                const epubFiles = fs
                    .readdirSync(EPUB_DIR)
                    .filter((file) => file.endsWith('.epub'));

                const matchedFile = epubFiles.find(
                    (file) =>
                        path.basename(file, '.epub').toLowerCase() === sanitizedTitle
                );

                if (!matchedFile) {
                    return reply.status(404).send({ error: 'Book not found' });
                }

                const filePath = path.join(EPUB_DIR, matchedFile);

                // Check if the file exists
                if (!fs.existsSync(filePath)) {
                    return reply.status(404).send({ error: 'File not found' });
                }

                // Use sendFile to handle the download
                return reply.sendFile(matchedFile, EPUB_DIR, {
                    // Optional: Customize headers if needed
                    // 'Content-Disposition' is handled by sendFile by default
                });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to download the book' });
            }
        }
    );
}
