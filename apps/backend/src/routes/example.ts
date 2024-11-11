import { FastifyInstance } from 'fastify';

export default async function exampleRoute(app: FastifyInstance) {
  app.get('/example', async () => {
    return { message: 'Hello from Fastify' };
  });
}