import fp from 'fastify-plugin';
import cors from 'fastify-cors';

export default fp(async (app) => {
  app.register(cors, {
    origin: true, // Allow all origins; customize for specific domains
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  });
});