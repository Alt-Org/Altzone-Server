import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RequestLoggerService } from './RequestLogger.service';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Interceptor that logs HTTP request and response details using the provided.
 *
 * This interceptor captures the HTTP method, URL, request body, response status code, and response time.
 * It also logs errors if they occur during request handling, including error details and status code.
 * For non-HTTP contexts, the interceptor simply passes through without logging.
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: RequestLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const requestTimestamp = Date.now();

    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const { method, url, body } = req;

      return next.handle().pipe(
        tap(() => {
          this.logger.log({
            method,
            url,
            body,
            statusCode: res.statusCode,
            type: 'http',
            responseTime: Date.now() - requestTimestamp,
          });
        }),
        catchError((err) => {
          const statusCode = err?.response?.statusCode || err?.status || 500;
          this.logger.log({
            method,
            url,
            body,
            statusCode,
            type: 'http',
            responseTime: Date.now() - requestTimestamp,
            error: err?.response || err?.message || err,
          });
          return throwError(() => err);
        }),
      );
    }
    // For non-HTTP contexts, simply pass through without logging
    return next.handle();
  }
}
