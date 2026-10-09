import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ConversationNotFoundError } from '../../domain/conversation-not-found.error.ts';
import { UnsupportedModelError } from '../../domain/unsupported-model.error.ts';

/**
 * Maps the chat errors thrown before a stream starts to HTTP responses.
 * Errors while streaming are `error` events instead (headers are sent).
 */
@Catch(UnsupportedModelError, ConversationNotFoundError)
export class ChatErrorFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(error: Error, host: ArgumentsHost) {
    super.catch(toHttpException(error), host);
  }
}

function toHttpException(error: Error): HttpException {
  if (error instanceof ConversationNotFoundError) {
    return new NotFoundException(error.message);
  }
  return new BadRequestException(error.message);
}
