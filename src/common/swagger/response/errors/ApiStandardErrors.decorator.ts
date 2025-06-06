import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { APIError } from '../../../controller/APIError';

/**
 * Supported HTTP error status codes for standard API responses.
 */
export type SupportedErrorCode = 400 | 401 | 403 | 404 | 409;

/**
 * Central record with error status code definitions
 */
const errorDefinitions: Record<SupportedErrorCode, ApiResponseOptions> = {
  400: {
    status: 400,
    description:
      'Validation error. Some fields are missing, of the wrong type, or failed validation.',
    type: APIError,
    example: {
      statusCode: 400,
      errors: [
        {
          response: 'NOT_STRING',
          status: 400,
          message: 'name must be a string',
          name: '',
          reason: 'NOT_STRING',
          field: 'name',
          value: '1',
          additional: 'isString',
          statusCode: 400,
          objectType: 'APIError',
        },
      ],
    },
  },
  401: {
    status: 401,
    description:
      'Not authenticated. The Authorization header is missing or the token is expired. ' +
      '[More info](https://github.com/Alt-Org/Altzone-Server/wiki/2.-Authentication-and-authorization)',
    type: APIError,
    example: {
      statusCode: 401,
      errors: [
        {
          response: 'AUTHENTICATION_FAILED',
          status: 401,
          message: 'Could not authenticate the user',
          name: '',
          reason: 'AUTHENTICATION_FAILED',
          field: 'string',
          value: 'string',
          additional: 'string',
          statusCode: 401,
          objectType: 'APIError',
        },
      ],
    },
  },
  403: {
    status: 403,
    description:
      'No permission. The user lacks authorization to perform the requested action. ' +
      '[More info](https://github.com/Alt-Org/Altzone-Server/wiki/2.-Authentication-and-authorization)',
    type: APIError,
    example: {
      statusCode: 403,
      errors: [
        {
          response: 'NOT_AUTHORIZED',
          status: 403,
          message:
            'The logged-in user has no permission to execute create_request action',
          name: '',
          reason: 'NOT_AUTHORIZED',
          field: 'string',
          value: 'string',
          additional: 'create_request',
          statusCode: 403,
          objectType: 'APIError',
        },
      ],
    },
  },
  404: {
    status: 404,
    description:
      'Not found. No matching object was found for the given identifier.',
    type: APIError,
    example: {
      statusCode: 404,
      errors: [
        {
          response: 'NOT_FOUND',
          status: 404,
          message: 'Could not find any objects with specified id',
          name: '',
          reason: 'NOT_FOUND',
          field: '_id',
          value: '64df3aad42cbaf850a3f891f',
          additional: 'string',
          statusCode: 404,
          objectType: 'APIError',
        },
      ],
    },
  },
  409: {
    status: 409,
    description: 'Conflict. A unique constraint was violated.',
    type: APIError,
    example: {
      statusCode: 409,
      errors: [
        {
          response: 'NOT_UNIQUE',
          status: 409,
          message: 'Field "name" with value "John" already exists',
          name: '',
          reason: 'NOT_UNIQUE',
          field: 'name',
          value: 'John',
          additional: 'string',
          statusCode: 409,
          objectType: 'APIError',
        },
      ],
    },
  },
};

/**
 * Adds standard error responses to swagger definition using Nest's `@ApiResponse()` decorators
 * It supports all common error cases.
 *
 * Notice that the decorator should be used for controller methods only.
 *
 * @param statusCodes One or more standard error HTTP status codes.
 *
 * @example
 * ```ts
 * @Get
 * @ApiStandardErrors(400, 401, 403)
 * async myControllerMethod(){
 *  return true;
 * }
 * ```
 *
 * @returns A composite NestJS decorator applying appropriate standard error responses.
 */
export function ApiStandardErrors(...statusCodes: SupportedErrorCode[]) {
  if (!statusCodes || statusCodes.length === 0) applyDecorators();

  const uniqueCodes = Array.from(new Set(statusCodes));

  const decorators = uniqueCodes.map((code) =>
    ApiResponse(errorDefinitions[code]),
  );

  return applyDecorators(...decorators);
}
