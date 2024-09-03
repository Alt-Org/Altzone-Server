# Release notes 03.09.2024

[View swagger notes here](https://swagger.altzone.fi/#/release-03-09-24)

_Table of content_:
1. [General changes]()
   
   1.1 [Clan data]()
   
   1.2 [Error responses]()
   
2. [Endpoints changes]()
   
   2.1 [/clan]()
   
   2.2 [/stock]()
   
   2.3 [/soulhome]()
   
   2.4 [/room]()
   
   2.5 [/item]()
   
   2.6 [/chat]()
   
## General changes

### Clan data
Most of the changes are related to clan data: 
- Clan SoulHome and its Rooms
- Clan Stock
- Items in Rooms and Stock

### Error responses
There are also changes in the errors' shape. 
New shape of the error is made for making it easier to manipulate its content programmatically.

All of the errors coming from new endpoints or endpoints, which are going to be changed will come in this shape.

The shape of the body of error response is looks as follows:

```ts
// Request to /clan/_:id GET, where _id field is in invalid form


// Response status code is 400
// Response body:
{
    // Response status code, 
    // in case of multiple errors the statusCode of the first will be returned
    statusCode: 400,
    // Array with errors, 
    // it will always be an array even if there are only one error happen
    errors: [
        {
            // Message for developer, explaining what happen
            "message": "_id must be a mongodb id",

            // Why the error happen, enum. Full list of the values are specified below
            "reason": "NOT_ALLOWED",

            // Where the error happen. Not always specified
            "field": "_id",

            // The above field value
            "value": "not_id",

            // Some additional information.
            //
            // In case of validation errors value from class-validator lib will be used. 
            // This value is more specific than the reason field. 
            // The full list of the possible values can be found from the link below
            "additional": "isMongoId",

            // HTTP status code
            "statusCode": 400,

            // What type of object it is. Can be used for example in parsing
            "objectType": "APIError",


            //Ignore these, they might be removed in the future
            "response": "NOT_ALLOWED",
            "name": "",
            "status": 400,
        }
    ]
}
```
You can determine the value of the additional field in validation errors 
by making the first letter of decorator function small. 
For example @IsMongoId() => "isMongoId". [class-validator lib decorators](https://github.com/typestack/class-validator?tab=readme-ov-file#validation-decorators).

Below is a list of error reasons:

```ts
enum APIErrorReason {
    // Could not find any object(s)
    NOT_FOUND = 'NOT_FOUND',

    // Bad request, general bad request error.
    BAD_REQUEST = 'BAD_REQUEST',

    // Request field is not unique
    NOT_UNIQUE = 'NOT_UNIQUE',

    // Request required field is not provided
    REQUIRED = 'REQUIRED',
    // Request field is not allowed
    NOT_ALLOWED = 'NOT_ALLOWED',
    // General validation error
    VALIDATION = 'VALIDATION',
    // Specified request field is not a string
    NOT_STRING = 'NOT_STRING',
    // Specified request field is not a number
    NOT_NUMBER = 'NOT_NUMBER',
    // Specified request field is not a boolean
    NOT_BOOLEAN = 'NOT_BOOLEAN',
    // Specified request field is not an array
    NOT_ARRAY = 'NOT_ARRAY',
    // Specified request field is not an object
    NOT_OBJECT = 'NOT_OBJECT',
    // Specified request field is not a date
    NOT_DATE = 'NOT_DATE',
    // Specified request field has a value which is not one of the enum values
    WRONG_ENUM = 'WRONG_ENUM',
    // Specified request field is less than allowed minimum value
    LESS_THAN_MIN = 'LESS_THAN_MIN',
    // Specified request field is larger than allowed maximum value
    MORE_THAN_MAX = 'MORE_THAN_MAX',

    // Request is made without authentication
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    // Request's authentication token is in from format
    INVALID_AUTH_TOKEN = 'INVALID_AUTH_TOKEN',
    // Could not authenticate the user
    AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',

    // Logged-in user has no access or rights to perform an action
    NOT_AUTHORIZED = 'NOT_AUTHORIZED',

    // The maximum amount of requests allowed for one user is exceeded
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

    // Server side error, which happened due to developer error
    MISCONFIGURED = 'MISCONFIGURED',
    // The endpoint or the whole API is not available to be used
    NOT_AVAILABLE = 'NOT_AVAILABLE',
    // Any unexpected error happen on the server side
    UNEXPECTED = 'UNEXPECTED'
}
```

## Changes of endpoints

### /clan

- Changed error responses to new error shapes for all `/clan`, but not `/clan/leave`, `/clan/exclude`, `/clan/join`
- The POST method now also creates for the new Clan 
  a SoulHome with 30 Rooms, Stock, as well as default Items placed to Stock and one of Rooms
- Moved `/clan/join/leave` to `/clan/leave`
- Added `/clan/exclude` to exclude player from clan

### /stock

- Removed almost all endpoints except for GET methods. 
  Now stock is created, updated and removed via other endpoints. So it is basically read-only on this endpoint.
- New error responses shape

### /soulhome

- Removed almost all endpoints except for GET method. 
  Now SoulHome is created, updated and removed via other endpoints. So it is basically read-only on this endpoint.
  Since there can be only one SoulHome in the Clan and Player can be a member only of one Clan, 
  SoulHome GET endpoint is returning SoulHome of the Clan to which Player belongs to.
- New error responses shape

### /room

- Removed almost all endpoints except for GET and PUT methods. 
  Now Room is created and removed via other endpoints.
- Added `/room/activate` for activating the Room
- New error responses shape

### /item

- Removed almost all endpoints except for GET method. So it is basically read-only on this endpoint.
  Now Item is created, updated and removed via other endpoints.
- New error responses shape

### /chat

- Removed completely out of use and all endpoints are returning Not Implemented (501) error.
  It was removed due to requirements from Google Play of data collection of minors (<13 years).
  The API should store only messages of persons above age of 13. Such functionality is yet to be implemented.
