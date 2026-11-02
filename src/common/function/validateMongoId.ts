import { BadRequestException } from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { APIError } from '../controller/APIError';
import { APIErrorReason } from '../controller/APIErrorReason';

/**
 * Throws the standard API validation error when a value is not a MongoDB ID.
 */
export function validateMongoId(field: string, value: unknown): void {
  if (typeof value === 'string' && isMongoId(value)) return;

  throw new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    errors: [
      new APIError({
        reason: APIErrorReason.VALIDATION,
        message: `${field} must be a MongoDB ObjectId`,
        field,
        value,
      }),
    ],
  });
}
