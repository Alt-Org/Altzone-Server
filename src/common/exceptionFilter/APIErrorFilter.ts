import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { APIError, APIErrorArray } from '../controller/APIError';

/**
 * Error filter to handle thrown APIError.
 *
 * Filter will return APIError as it is to client in the standard error response format
 */
@Catch(APIError, APIErrorArray)
export class APIErrorFilter implements ExceptionFilter {
  catch(exception: APIError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errors: APIError[] = [];

    if (exception instanceof APIErrorArray) {
      errors = exception.errors;
    } else errors = Array.isArray(exception) ? exception : [exception];

    response.status(errors[0].statusCode).json({
      errors,
      statusCode: errors[0].statusCode,
    });
  }
}
