import { FastifyInstance } from 'fastify';
import { ProgressService } from '../../db/services/progress';
import { BookProgressRequest } from '../../data/request/book/bookProgressRequest';

export default async function progressRoutes(app: FastifyInstance) {
    /**
     * Update or Set Reading Progress for a Book
     */
    app.post<{ Body: BookProgressRequest }>(
        '/progress',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Progress'],
                description: 'Set or update reading progress for a specific book',
                body: {
                    type: 'object',
                    required: ['book', 'progress'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                        progress: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Reading progress as a percentage (0 to 1)',
                        },
                    },
                },
                response: {
                    200: {
                        description: 'Progress updated successfully',
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
            const { book, progress } = request.body;
            const userId = request.user.id; // Extracted from the authenticated user token

            if (progress < 0 || progress > 1) {
                return reply.status(400).send({ error: 'Progress must be between 0 and 1.' });
            }

            try {
                await ProgressService.updateProgress(userId, book, progress);
                return reply.send({ message: 'Progress updated successfully.' });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to update progress.' });
            }
        }
    );

    /**
     * Get Reading Progress for a Specific Book
     */
    app.get(
        '/:book/progress',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Progress'],
                description: 'Get reading progress for a specific book',
                querystring: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Progress retrieved successfully',
                        type: 'object',
                        properties: {
                            progress: { type: 'number' },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    404: {
                        description: 'Progress not found',
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
                const progress = await ProgressService.getProgress(userId, book);

                if (!progress) {
                    return reply.status(404).send({ error: 'Progress not found for the specified book.' });
                }

                return reply.send({ progress });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to retrieve progress.' });
            }
        }
    );

    /**
     * Get All Books with Progress for the User
     */
    app.get(
        '/progress/all',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Progress'],
                description: 'Get progress for all books the user has started reading',
                response: {
                    200: {
                        description: 'All progress retrieved successfully',
                        type: 'object',
                        properties: {
                            books: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        book: { type: 'string' },
                                        progress: { type: 'number' },
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
                const books = await ProgressService.getProgressByUser(userId);
                return reply.send({ books });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to retrieve progress for all books.' });
            }
        }
    );
}
