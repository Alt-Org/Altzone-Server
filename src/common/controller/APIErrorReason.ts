/**
 * An enum used to determine the APIError reason or why the error occurred in other words.
 *
 * The enum extending the SEReason enum.
 */
export enum APIErrorReason {
    NOT_FOUND = 'NOT_FOUND',

    BAD_REQUEST = 'BAD_REQUEST',
    NOT_UNIQUE = 'NOT_UNIQUE',

    REQUIRED = 'REQUIRED',
    NOT_ALLOWED = 'NOT_ALLOWED',
    VALIDATION = 'VALIDATION',
    NOT_STRING = 'NOT_STRING',
    NOT_NUMBER = 'NOT_NUMBER',
    NOT_BOOLEAN = 'NOT_BOOLEAN',
    NOT_ARRAY = 'NOT_ARRAY',
    NOT_OBJECT = 'NOT_OBJECT',
    NOT_DATE = 'NOT_DATE',
    WRONG_ENUM = 'WRONG_ENUM',
    LESS_THAN_MIN = 'LESS_THAN_MIN',
    MORE_THAN_MAX = 'MORE_THAN_MAX',

    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    INVALID_AUTH_TOKEN = 'INVALID_AUTH_TOKEN',
    AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',

    NOT_AUTHORIZED = 'NOT_AUTHORIZED',

    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

    MISCONFIGURED = 'MISCONFIGURED',
    NOT_AVAILABLE = 'NOT_AVAILABLE',
    UNEXPECTED = 'UNEXPECTED'
}