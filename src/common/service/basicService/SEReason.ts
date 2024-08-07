/**
 * An enum used to determine the ServiceError reason or why the error occurred in other words
 */
export enum SEReason {
    NOT_FOUND = 'NOT_FOUND',
 
    REQUIRED = 'REQUIRED',
    NOT_ALLOWED = 'NOT_ALLOWED',
    NOT_UNIQUE = 'NOT_UNIQUE',

    NOT_STRING = 'NOT_STRING',
    NOT_NUMBER = 'NOT_NUMBER',
    NOT_BOOLEAN = 'NOT_BOOLEAN',
    NOT_ARRAY = 'NOT_ARRAY',
    NOT_OBJECT = 'NOT_OBJECT',
    WRONG_ENUM = 'WRONG_ENUM',
    NOT_DATE = 'NOT_DATE',
    LESS_THAN_MIN = 'LESS_THAN_MIN',
    MORE_THAN_MAX = 'MORE_THAN_MAX',
 
    UNEXPECTED = 'UNEXPECTED',
    MISCONFIGURED = 'MISCONFIGURED'
 }