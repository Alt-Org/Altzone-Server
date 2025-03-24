import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { APIError } from '../controller/APIError';

/**
 * Error filter to handle thrown APIError.
 *
 * Filter will return APIError as it is to client
 */
@Catch(APIError)
export class APIErrorFilter implements ExceptionFilter {
  catch(exception: APIError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(exception.statusCode).json(exception);
  }
}
