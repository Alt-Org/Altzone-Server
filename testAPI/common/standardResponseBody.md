# Standard response body

The response body of successful request should be as follows:
```
{
    "data": {
        "{{Model_name}}": { {{model_object_or_array_of_objects}} }
    },
    "metaData": {
        "dataKey": "{{key_used_in_data_object}}",
        "modelName": "{{model_name}}",
        "dataType": "{{type_of_response_data}}",
        "dataCount": {{count_of_returned_items}}
    },
    "paginationData": {
        "currentPage": {{current_page_number}},
        "limit": {{max_amount_of_items_per_page}},
        "offset": {{place_in_the_collection}},
        "itemCount": {{count_of_items_in_whole_collection}},
        "pageCount": {{pages_count_with_specified_limit_and_search_query}}
    }
}
```

1. data - object with actual response, which contains object or array. Response key is the name of the requested model
2. metadata - object with description of data object:

   - dataKey - key with witch response data object can be accessed, usually model name
   - modelName - model name of the response data
   - dataType - type of response. Can be 'Array' or 'Object'
   - dataCount - returned items count. For 'Object' data type it is always 1

3. paginationData - object, which coming only for GET many requests. It contains pagination related info:
   
   - currentPage - on which page the response is. If where are found more elements than max amount the API is set to return at once, response data will be divided into the same size chunks - pages.
   - limit - max item count returned at once
   - offset - total count of items previously already returned
   - itemCount - total count of items found with the search query
   - pageCount - total count of pages found with the search query
