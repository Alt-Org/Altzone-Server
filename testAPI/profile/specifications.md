# Functionality specifications for /profile endpoint



## Creating
### Authorization rules
No rules

### Request
No authentication needed

### Request queries
No queries

### Request object
Includes:

1. username - must be unique string
2. password - must be string
3. Player - player object, optional

### Response object
The response should be in a standard shape, which is specified in the common section.
Created Profile document (with nested Player if it was specified in the request) with 200 status

### Errors
All standard create errors except related to authentication and authorization.

### Side effects
1. If Player object provided in the request then creates a Player document as well



## Reading
### Authorization rules
1. Publicly accessed fields:

    - _id 
    - username 

2. Profile owner accessed fields:

    - _id
    - username
    - Player (via with or all query)
    
### Request
1. /:_id for finding one item
2. / for finding many
3. Authentication mandatory

### Request queries
All standard queries can be applied

### Request object
No request object

### Response object
The response should be in a standard shape, which is specified in the common section.
Found Profile document (with nested Player if was queried) or array of documents with 200 status

### Errors
All standard read errors.



## Updating
### Authorization rules
1. Only owner can change

### Request
1. Authentication required

### Request queries
No queries

### Request object
Includes:

1. _id - must be _id string
2. username - must be an unique string, optional 
3. password - must be a string, optional

### Response object
No response body with status 204

### Errors
All standard update errors.

### Side effects
No side effects



## Deleting
### Authorization rules
1. Only owner can delete

### Request
1. /:_id delete one 
2. Authentication mandatory

### Request queries
No queries

### Request object
No request object

### Response object
No response body with status 204

### Errors
1. All standard delete errors.
2. 403:

   - No permission
   - Profile not found
   
3. 400:
 
   - Can not delete clan, where player is the only admin

### Side effects
1. Deletes associated Player, which first:

   - Deletes player_id from clan admins array
   - Deletes all associated CustomCharacters
   - Deletes all associated RaidRooms
