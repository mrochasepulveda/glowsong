import { FastifyRequest, FastifyReply } from 'fastify';

// Extends Fastify request with user payload after JWT verification
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify<{ sub: string }>();
    request.userId = decoded.sub;
  } catch (err) {
    reply.status(401).send({ error: 'Token inválido o expirado' });
  }
}
