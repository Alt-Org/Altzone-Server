import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { validateMongoId } from '../function/validateMongoId';

/**
 * Validates update payload IDs before guards, interceptors, and pipes run.
 */
@Injectable()
export class ValidateUpdateMongoIdMiddleware implements NestMiddleware {
  public use(request: Request, _response: Response, next: NextFunction): void {
    const updateItems = Array.isArray(request.body)
      ? request.body
      : [request.body];

    for (const updateItem of updateItems) {
      if (updateItem?._id !== undefined) validateMongoId('_id', updateItem._id);
    }

    next();
  }
}
