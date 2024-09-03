/**
 * An enum used to determine the APIError reason or why the error occurred in other words.
 *
 * The enum extending the SEReason enum.
 */
export enum APIErrorReason {
    /**
     * Could not find any object(s)
     */
    NOT_FOUND = 'NOT_FOUND',

    /**
     * Bad request, general bad request error. 
     *
     * If possible please specify more concrete reason rather than  
     */
    BAD_REQUEST = 'BAD_REQUEST',
    /**
     * Request field is not unique
     */
    NOT_UNIQUE = 'NOT_UNIQUE',

    /**
     * Request required field is not provided
     */
    REQUIRED = 'REQUIRED',
    /**
     * Request field is not allowed
     */
    NOT_ALLOWED = 'NOT_ALLOWED',
    /**
     * General validation error
     */
    VALIDATION = 'VALIDATION',
    /**
     * Specified request field is not a string
     */
    NOT_STRING = 'NOT_STRING',
    /**
     * Specified request field is not a number
     */
    NOT_NUMBER = 'NOT_NUMBER',
    /**
     * Specified request field is not a boolean
     */
    NOT_BOOLEAN = 'NOT_BOOLEAN',
    /**
     * Specified request field is not an array
     */
    NOT_ARRAY = 'NOT_ARRAY',
    /**
     * Specified request field is not an object
     */
    NOT_OBJECT = 'NOT_OBJECT',
    /**
     * Specified request field is not a date
     */
    NOT_DATE = 'NOT_DATE',
    /**
     * Specified request field has a value which is not one of the enum values
     */
    WRONG_ENUM = 'WRONG_ENUM',
    /**
     * Specified request field is less than allowed minimum value
     */
    LESS_THAN_MIN = 'LESS_THAN_MIN',
    /**
     * Specified request field is larger than allowed maximum value
     */
    MORE_THAN_MAX = 'MORE_THAN_MAX',

    /**
     * Request is made without authentication
     */
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    /**
     * Request's authentication token is in from format
     */
    INVALID_AUTH_TOKEN = 'INVALID_AUTH_TOKEN',
    /**
     * Could not authenticate the user
     */
    AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',

    /**
     * Logged-in user has no access or rights to perform an action
     */
    NOT_AUTHORIZED = 'NOT_AUTHORIZED',

    /**
     * The maximum amount of requests allowed for one user is exceeded
     */
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

    /**
     * Server side error, which happened due to developer error.
     *
     * For example by using some class method in wrong way
     */
    MISCONFIGURED = 'MISCONFIGURED',
    /**
     * The endpoint or the whole API is not available to be used
     */
    NOT_AVAILABLE = 'NOT_AVAILABLE',
    /**
     * Any unexpected error happen on the server side
     */
    UNEXPECTED = 'UNEXPECTED'
}