import { HttpException } from '@nestjs/common';
import AddType, { isType } from '../base/decorator/AddType.decorator';
import { SERVICE_ERROR_TYPE } from '../service/basicService/ServiceError';
import { APIErrorReason } from './APIErrorReason';

/**
 * Constant, which determines the objectType field in APIErrors objects.
 *
 * Used to determine whenever the objects is APIErrors or not
 */
export const API_ERROR_TYPE = 'APIError';

type APIErrorArgs = {
  /**
   * Why the error is happen
   * @default APIErrorReason.UNEXPECTED
   */
  reason?: APIErrorReason;
  /**
   * HTTP status code of the error
   * @default null
   */
  statusCode?: number;
  /**
   * Message should specify why error happen, mostly used for other developers "FYI"
   * @default null
   */
  message?: string;
  /**
   * On what field the error happen (if the field is possible to define), mostly used for validation errors
   * @default null
   */
  field?: string;
  /**
   * Value of the field (only if the field is specified), mostly used for validation errors
   * @default null
   */
  value?: any;
  /**
   * Any additional data to provide.
   * For example if the error is thrown by some method and is UNEXPECTED, when this field should contain the thrown error
   * @default null
   */
  additional?: any;
};

/**
 * The class represents an error occurred on controller level
 *
 * The class is used to send an error to the client side
 *
 * It extends the Nest HttpException and can be handled by built-in filters (not recommended)
 *
 * @see [Nest Filters](https://docs.nestjs.com/exception-filters)
 */
@AddType(API_ERROR_TYPE)
export class APIError extends HttpException {
  constructor({
    reason = APIErrorReason.UNEXPECTED,
    statusCode,
    message = null,
    field = null,
    value = null,
    additional = null,
  }: APIErrorArgs) {
    const validStatus = statusCode
      ? isStatusValid(statusCode)
        ? statusCode
        : 500
      : determineStatus(reason);
    super(reason, validStatus);

    this.reason = reason;
    this.message = message;
    this.field = field;
    this.value = value;
    this.additional = additional;
    this.statusCode = validStatus;
  }

  /**
   * Name of the error
   */
  name: string;

  /**
   * Error stack
   */
  stack?: string;

  /**
   * Why the error is happened
   * @example "NOT_STRING"
   */
  reason: APIErrorReason;

  /**
   * HTTP status code of the error
   * @example 400
   */
  statusCode: number | null;

  /**
   * Message specifies why error happened, for developers "FYI"
   * @example "name must be a string"
   */
  message: string | null;

  /**
   * On what field the error happen (if the field is possible to define), mostly found in validation errors
   * @example name
   */
  field: string | null;

  /**
   * Value of the field (only if the field is specified), mostly found in validation errors
   * @example 1
   */
  value: string | null;

  /**
   * Any additional data provided.
   * For example if the error is thrown by some method and is UNEXPECTED, when this field should contain the thrown error
   * @example isString
   */
  additional: any | null;
}

export class APIErrorArray extends Error {
  constructor(errors: APIError[] = []) {
    super('Array of APIErrors');
    this.errors = errors;
  }

  public readonly errors: APIError[];

  push(error: APIError) {
    this.errors.push(error);
  }

  get length() {
    return this.errors.length;
  }

  [Symbol.iterator]() {
    return this.errors[Symbol.iterator]();
  }
}

/**
 * Determines whenever the specified object or array is APIError or not.
 *
 * In case the item is an array, it will check whenever the first item of an array is a APIError or not
 * @param item object or array to check
 * @returns _true_ if object is APIError or array contains APIError objects, _false_ if not
 */
export function isAPIError(item: any | any[]) {
  if (Array.isArray(item)) return isType(item[0], API_ERROR_TYPE);

  return isType(item, API_ERROR_TYPE);
}

/**
 * Converts any error to APIError object.
 *
 * Notice, that it is advisable to convert ServiceErrors with this method.
 * All errors of other types will be converted to Unexpected and their content will be put to the "additional" field
 * @param error error to convert
 *
 */
export function convertToAPIError(error: any) {
  if (isType(error, SERVICE_ERROR_TYPE)) return new APIError({ ...error });

  if (isType(error, API_ERROR_TYPE)) return error as APIError;

  return new APIError({ additional: error });
}

function determineStatus(reason: APIErrorReason) {
  const badRequest = [
    APIErrorReason.BAD_REQUEST,
    APIErrorReason.NOT_ALLOWED,
    APIErrorReason.REQUIRED,
    APIErrorReason.VALIDATION,
    APIErrorReason.NOT_STRING,
    APIErrorReason.NOT_NUMBER,
    APIErrorReason.NOT_BOOLEAN,
    APIErrorReason.NOT_ARRAY,
    APIErrorReason.NOT_OBJECT,
    APIErrorReason.WRONG_ENUM,
    APIErrorReason.LESS_THAN_MIN,
    APIErrorReason.MORE_THAN_MAX,
    APIErrorReason.NOT_DATE,
  ];

  const notAuthenticated = [
    APIErrorReason.NOT_AUTHENTICATED,
    APIErrorReason.INVALID_AUTH_TOKEN,
    APIErrorReason.AUTHENTICATION_FAILED,
  ];

  const notAuthorized = [APIErrorReason.NOT_AUTHORIZED];

  const conflict = [APIErrorReason.NOT_UNIQUE];

  const tooManyRequests = [APIErrorReason.TOO_MANY_REQUESTS];

  if (badRequest.includes(reason)) return 400;

  if (notAuthenticated.includes(reason)) return 401;

  if (notAuthorized.includes(reason)) return 403;

  if (reason === APIErrorReason.NOT_FOUND) return 404;

  if (conflict.includes(reason)) return 409;

  if (tooManyRequests.includes(reason)) return 429;

  if (reason === APIErrorReason.NOT_AVAILABLE) return 503;

  return 500;
}

function isStatusValid(status: number) {
  return status >= 200 && status <= 511;
}
