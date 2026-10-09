import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { User } from '../../../user/domain/user.ts';
import { CheckConversationAccessUseCase } from '../../application/check-conversation-access.use-case.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * For SSE routes on `/conversations/:id`: a missing or foreign conversation
 * is a 404 before the stream starts. Checking in the handler is not enough:
 * an async `@Sse()` handler that fails after a database round trip has its
 * error sent as an SSE `error` event with status 200 (Nest commits the
 * headers on the next macrotask). Guards are awaited before that.
 */
@Injectable()
export class ConversationAccessGuard implements CanActivate {
  constructor(private readonly checkAccess: CheckConversationAccessUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    const id = request.params.id;
    // Not a UUID: let `ParseUUIDPipe` answer 400, as on the other routes.
    if (typeof id !== 'string' || !UUID.test(id) || !request.user) return true;
    // Throws `ConversationNotFoundError`, which `ChatErrorFilter` makes a 404.
    await this.checkAccess.execute(request.user.id, id);
    return true;
  }
}
