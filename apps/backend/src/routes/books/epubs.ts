import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import path from 'path';
import { findEpubByTitle, getAllEpubFiles, parseEpub, sortBooks } from '../../utils/epubUtils';
import { Book } from '../../types/book';
import { GetEpubsQuery, PaginatedBooks } from '../../types/pagination/paginatedBook';

export default async function epubRoutes(app: FastifyInstance) {
    const EPUB_DIR = path.join(__dirname, '../../../../../../epubs');

    /**
     * Serve EPUB Covers and Full Book Items with Pagination and Sorting (Authenticated)
     */
    app.get<{
        Querystring: GetEpubsQuery;
    }>(
        '/epubs',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['EPUB'],
                description: 'Get covers and details of all EPUB files in the directory with pagination and sorting (Authenticated)',
                security: [{ Bearer: [] }],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1, default: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100, default: 12 },
                        sort: { 
                            type: 'string', 
                            enum: ['fileName', 'title', 'author', 'date', 'publisher', 'language'], 
                            default: 'title' 
                        },
                        order: { 
                            type: 'string', 
                            enum: ['asc', 'desc'], 
                            default: 'asc' 
                        },
                    },
                    additionalProperties: false,
                },
                response: {
                    200: {
                        description: 'Paginated and sorted covers and details fetched successfully',
                        type: 'object',
                        properties: {
                            totalItems: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            currentPage: { type: 'integer' },
                            pageSize: { type: 'integer' },
                            books: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        fileName: { type: 'string' },
                                        title: { type: 'string' },
                                        author: { type: 'string' },
                                        description: { type: 'string' },
                                        cover: { type: ['string', 'null'] }, // Base64 Data URL or null
                                        date: { type: ['string', 'null'] },
                                        publisher: { type: ['string', 'null'] },
                                        language: { type: ['string', 'null'] },
                                        tag: { type: ['string', 'null'] },
                                        downloadUrl: { type: 'string' },
                                    },
                                },
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
        async (request: FastifyRequest<{ Querystring: GetEpubsQuery }>, reply: FastifyReply) => {
            try {
                const { page = 1, limit = 10, sort = 'fileName', order = 'asc' } = request.query;

                // Validate and sanitize pagination parameters
                const currentPage = Math.max(1, page);
                const pageSize = Math.min(Math.max(1, limit), 100); // Limit pageSize to a maximum of 100

                const epubFiles = await getAllEpubFiles();
                const totalItems = epubFiles.length;
                const totalPages = Math.ceil(totalItems / pageSize);
                const offset = (currentPage - 1) * pageSize;
                const paginatedFiles = epubFiles.slice(offset, offset + pageSize);

                const parsePromises = paginatedFiles.map((filePath) => parseEpub(filePath));
                let books: Book[] = await Promise.all(parsePromises);

                // Apply sorting
                books = sortBooks(books, sort, order);

                const paginatedResponse: PaginatedBooks = {
                    totalItems,
                    totalPages,
                    currentPage,
                    pageSize,
                    books,
                };

                return reply.send(paginatedResponse);
            } catch (error) {
                app.log.error(error);
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
                            fileName: { type: 'string' },
                            title: { type: 'string' },
                            author: { type: 'string' },
                            description: { type: 'string' },
                            cover: { type: ['string', 'null'] }, // Base64 Data URL or null
                            date: { type: ['string', 'null'] },
                            publisher: { type: ['string', 'null'] },
                            language: { type: ['string', 'null'] },
                            tag: { type: ['string', 'null'] },
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

            try {
                const matchedFile = await findEpubByTitle(title);

                if (!matchedFile) {
                    return reply.status(404).send({ error: 'Book not found' });
                }

                const book: Book = await parseEpub(matchedFile);

                return reply.send(book);
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

            try {
                const matchedFile = await findEpubByTitle(title);

                if (!matchedFile) {
                    return reply.status(404).send({ error: 'Book not found' });
                }

                // Use Fastify's built-in `sendFile` method to handle the file download
                // Ensure that the `fastify-static` plugin is registered in your server setup
                return reply.sendFile(path.basename(matchedFile), EPUB_DIR);
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to download the book' });
            }
        }
    );
}
