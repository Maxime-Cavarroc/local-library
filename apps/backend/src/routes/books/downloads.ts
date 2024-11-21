import { FastifyInstance } from 'fastify';
import { DownloadedService } from '../../db/services/downloads';

export default async function downloadRoutes(app: FastifyInstance) {
    /**
     * Mark a Book as Downloaded
     */
    app.post<{ Body: { book: string } }>(
        '/downloaded',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Download'],
                description: 'Mark a book as downloaded by the authenticated user',
                body: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Book marked as downloaded successfully',
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    400: {
                        description: 'Invalid request',
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
                },
            },
        },
        async (request, reply) => {
            const { book } = request.body;
            const userId = request.user.id; // Extracted from the authenticated user token

            try {
                await DownloadedService.addDownloaded(userId, book);
                return reply.send({ message: 'Book marked as downloaded successfully.' });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to mark book as downloaded.' });
            }
        }
    );

    /**
     * Check if a Book has been Downloaded
     */
    app.get(
        '/:book/downloaded',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Download'],
                description: 'Check if a book has been downloaded by the authenticated user',
                params: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Downloaded status retrieved successfully',
                        type: 'object',
                        properties: {
                            downloaded: { type: 'boolean' },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { book } = request.params as { book: string };
            const userId = request.user.id;

            try {
                const downloaded = await DownloadedService.isDownloaded(userId, book);
                return reply.send({ downloaded: !!downloaded });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to check download status.' });
            }
        }
    );

    /**
     * Get All Downloaded Books for the User
     */
    app.get(
        '/downloaded/all',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Download'],
                description: 'Get all books downloaded by the authenticated user',
                response: {
                    200: {
                        description: 'Downloaded books retrieved successfully',
                        type: 'object',
                        properties: {
                            books: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        book: { type: 'string' },
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
                },
            },
        },
        async (request, reply) => {
            const userId = request.user.id;

            try {
                const books = await DownloadedService.getDownloadedByUser(userId);
                return reply.send({ books });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to retrieve downloaded books.' });
            }
        }
    );

    /**
     * Delete a Download Record for a Book
     */
    app.delete<{ Body: { book: string } }>(
        '/downloaded',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Download'],
                description: 'Delete a download record for a book for the authenticated user',
                body: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Download record deleted successfully',
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    404: {
                        description: 'Download record not found',
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
                },
            },
        },
        async (request, reply) => {
            const { book } = request.body;
            const userId = request.user.id;

            try {
                const downloaded = await DownloadedService.isDownloaded(userId, book);
                if (!downloaded) {
                    return reply.status(404).send({ error: 'Download record not found for the specified book.' });
                }

                await DownloadedService.removeDownloaded(userId, book);
                return reply.send({ message: 'Download record deleted successfully.' });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to delete download record.' });
            }
        }
    );
}
