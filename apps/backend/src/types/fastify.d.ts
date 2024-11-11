import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: Record<string, any>; // Define user as optional
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
