import fp from 'fastify-plugin';
import cors from 'fastify-cors';
import { FastifyInstance } from 'fastify';

/**
 * CORS configuration plugin
 * Allows Cross-Origin Resource Sharing (CORS) for the Fastify app
 */
export default fp(async (app: FastifyInstance) => {
  // Parse allowed origins from environment variable or set a default
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

  app.register(cors, {
    origin: (origin, callback) => {
      // Allow requests from allowed origins or no origin (e.g., server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
    credentials: true, // Enable credentials (cookies, authorization headers)
  });
});
