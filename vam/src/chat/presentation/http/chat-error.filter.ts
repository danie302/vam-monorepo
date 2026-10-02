import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { UnsupportedModelError } from '../../domain/unsupported-model.error.ts';

/**
 * Maps the chat errors thrown before the stream starts to HTTP responses.
 * Errors while streaming are `error` events instead (headers are sent).
 */
@Catch(UnsupportedModelError)
export class ChatErrorFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(error: UnsupportedModelError, host: ArgumentsHost) {
    super.catch(new BadRequestException(error.message), host);
  }
}
