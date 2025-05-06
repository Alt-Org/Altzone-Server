import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function Send204OnEmptyRes() {
  return UseInterceptors(Send204OnEmptyResInterceptor);
}

/**
 * Sends a 204 response to the client side if returned data from controller function is undefined
 */
@Injectable()
export class Send204OnEmptyResInterceptor implements NestInterceptor {
  public constructor() {}
  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(async (data: any) => {
        const awaitedData = data instanceof Promise ? await data : data;
        if (awaitedData != null) return awaitedData;

        const response = context.switchToHttp().getResponse();
        response.status(204);
        return null;
      }),
    );
  }
}
