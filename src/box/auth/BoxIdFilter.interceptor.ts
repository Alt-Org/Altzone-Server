import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, mergeMap } from 'rxjs';
import { BoxUser } from './BoxUser';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { NO_BOX_ID_FILTER } from './decorator/NoBoxIdFilter.decorator';
import { Request } from 'express';

/**
 * Interceptor used for testing sessions to prevent data leaks.
 * Interceptor get's the users box_id from the request and then filters
 * all outgoing data based on that box_id. So users are not able to get
 * any data from other boxes.
 */
@Injectable()
export class BoxIdFilterInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const noFilter = this.reflector.getAllAndOverride<boolean>(
      NO_BOX_ID_FILTER,
      [context.getHandler(), context.getClass()],
    );
    if (noFilter) return next.handle();

    const request = context.switchToHttp().getRequest();
    if (!request['user']) {
      this.attachBoxUserToRequest(request);
    }
    const boxUser: BoxUser = request.user;

    return next
      .handle()
      .pipe(
        mergeMap(async (data) =>
          this.filterByBoxId(await data, boxUser.box_id),
        ),
      );
  }

  /**
   *
   *
   * @param data Data to be filtered.
   * @param boxId The box ID used for filtering
   * @returns Data where box_id matches the boxId.
   */
  private filterByBoxId(data: any, boxId: string): any {
    if (
      data &&
      typeof data === 'object' &&
      data.data &&
      typeof data.data === 'object'
    ) {
      for (const key of Object.keys(data.data)) {
        const value = data.data[key];
        if (Array.isArray(value)) {
          const filtered = value.filter((item) => item?.box_id === boxId);
          data.data[key] = filtered;
          // Update metaData.dataCount if key matches metaData.dataKey
          if (
            data.metaData &&
            data.metaData.dataKey === key &&
            typeof data.metaData.dataCount === 'number'
          ) {
            data.metaData.dataCount = filtered.length;
          }
          if (
            data.paginationData &&
            typeof data.paginationData.itemCount === 'number'
          ) {
            data.paginationData.itemCount = filtered.length;
          }
        }
      }
      return data;
    }

    // If data is just an array, filter it
    if (Array.isArray(data)) {
      return data.filter((item) => item?.box_id === boxId);
    }

    // If data is an object with box_id, filter recursively
    if (data && typeof data === 'object') {
      if ('box_id' in data && data.box_id !== boxId) return undefined;
      for (const key of Object.keys(data)) {
        data[key] = this.filterByBoxId(data[key], boxId);
      }
    }
    return data;
  }

  /**
   * Attaches the authenticated user's box ID to the request object.
   *
   * @param request - The incoming HTTP request object, expected to contain an authorization header with a JWT token.
   * @throws {APIError} Throws an APIError with reason `NOT_AUTHENTICATED` if the JWT token is missing or invalid.
   *
   * @remarks
   * This method extracts the JWT token from the `Authorization` header, verifies it,
   * and attaches a new `BoxUser` instance to the request under the `user` property.
   * If verification fails, an authentication error is thrown.
   */
  private attachBoxUserToRequest(request: Request) {
    const token = request.headers.authorization?.split(' ')[1];
    try {
      const payload: BoxUser = this.jwtService.verify(token);
      request['user'] = new BoxUser(payload);
    } catch {
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHENTICATED,
        message:
          'All endpoints need to be provided an auth token in testing sessions.',
      });
    }
  }
}
