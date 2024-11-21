import { FastifyInstance } from 'fastify';
import { FavoriteService } from '../../db/services/favorites';

export default async function favoriteRoutes(app: FastifyInstance) {
    /**
     * Mark a Book as Favorite
     */
    app.post<{ Body: { book: string } }>(
        '/favorite',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Favorites'],
                description: 'Mark a book as favorite by the authenticated user',
                body: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Book marked as favorite successfully',
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
            const userId = request.user.id;

            try {
                await FavoriteService.addFavorite(userId, book);
                return reply.send({ message: 'Book marked as favorite successfully.' });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to mark book as favorite.' });
            }
        }
    );

    /**
     * Remove a Book from Favorites
     */
    app.delete<{ Body: { book: string } }>(
        '/favorite',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Favorites'],
                description: 'Remove a book from favorites for the authenticated user',
                body: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Book removed from favorites successfully',
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    404: {
                        description: 'Favorite record not found',
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
                const favorite = await FavoriteService.isFavorite(userId, book);
                if (!favorite) {
                    return reply.status(404).send({ error: 'Favorite record not found for the specified book.' });
                }

                await FavoriteService.removeFavorite(userId, book);
                return reply.send({ message: 'Book removed from favorites successfully.' });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to remove book from favorites.' });
            }
        }
    );

    /**
     * Check if a Book is Favorite
     */
    app.get(
        '/:book/favorite',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Favorites'],
                description: 'Check if a book is marked as favorite by the authenticated user',
                params: {
                    type: 'object',
                    required: ['book'],
                    properties: {
                        book: { type: 'string', description: 'Unique identifier of the book (e.g., file name)' },
                    },
                },
                response: {
                    200: {
                        description: 'Favorite status retrieved successfully',
                        type: 'object',
                        properties: {
                            favorite: { type: 'boolean' },
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
            const { book } = request.query;
            const userId = request.user.id;

            try {
                const favorite = await FavoriteService.isFavorite(userId, book);
                return reply.send({ favorite: !!favorite });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to check favorite status.' });
            }
        }
    );

    /**
     * Get All Favorite Books for the User
     */
    app.get(
        '/favorite/all',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Favorites'],
                description: 'Get all books marked as favorite by the authenticated user',
                response: {
                    200: {
                        description: 'Favorite books retrieved successfully',
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
                const books = await FavoriteService.getFavoritesByUser(userId);
                return reply.send({ books });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to retrieve favorite books.' });
            }
        }
    );
}
