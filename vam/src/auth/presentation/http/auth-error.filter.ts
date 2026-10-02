import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { EmailAlreadyRegisteredError } from '../../../user/domain/email-already-registered.error.ts';
import { InvalidCredentialsError } from '../../application/invalid-credentials.error.ts';

/** Maps the errors of the auth use cases to HTTP responses. */
@Catch(EmailAlreadyRegisteredError, InvalidCredentialsError)
export class AuthErrorFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  /** Converts the error and lets Nest's default filter write the response. */
  catch(error: Error, host: ArgumentsHost) {
    super.catch(toHttpException(error), host);
  }
}

/** The HTTP exception each use case error stands for. */
function toHttpException(error: Error): HttpException {
  if (error instanceof EmailAlreadyRegisteredError) {
    return new ConflictException(error.message);
  }
  return new UnauthorizedException(error.message);
}
