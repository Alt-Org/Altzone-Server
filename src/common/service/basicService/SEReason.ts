/**
 * An enum used to determine the ServiceError reason or why the error occurred in other words
 */
export enum SEReason {
    /**
     * Can not find something important, without this request can not be succeeded or anything at all
     */
    NOT_FOUND = 'NOT_FOUND',
 
    /**
     * Field / parameter is required
     */
    REQUIRED = 'REQUIRED',
    /**
     * Field / parameter is not allowed to use
     */
    NOT_ALLOWED = 'NOT_ALLOWED',
    /**
     * Provided field is not unique
     */
    NOT_UNIQUE = 'NOT_UNIQUE',

    /**
     * Provided field is not a string
     */
    NOT_STRING = 'NOT_STRING',
    /**
     * Provided field is not a number
     */
    NOT_NUMBER = 'NOT_NUMBER',
    /**
     * Provided field is not a boolean
     */
    NOT_BOOLEAN = 'NOT_BOOLEAN',
    /**
     * Provided field is not an array
     */
    NOT_ARRAY = 'NOT_ARRAY',
    /**
     * Provided field is not an object
     */
    NOT_OBJECT = 'NOT_OBJECT',
    /**
     * Provided field is not one of the enum fields
     */
    WRONG_ENUM = 'WRONG_ENUM',
    /**
     * Provided field is not a date
     */
    NOT_DATE = 'NOT_DATE',
    /**
     * Provided field is less than allowed minimum
     */
    LESS_THAN_MIN = 'LESS_THAN_MIN',
    /**
     * Provided field is more than allowed maximum
     */
    MORE_THAN_MAX = 'MORE_THAN_MAX',
 
    /**
     * Provided field is not valid. General validation error, 
     * please use more specific error whenever it is possible
     */
    VALIDATION = 'VALIDATION',

    /**
     * The error is unexpected
     */
    UNEXPECTED = 'UNEXPECTED',
    /**
     * Something wrong with configuration made by developer. 
     * 
     * For example created class instance is missing a required field to perform some action.
     */
    MISCONFIGURED = 'MISCONFIGURED'
 }