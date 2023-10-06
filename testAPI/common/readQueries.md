# Standard read queries

This queries can be used one at the time or all together:

## Read one
1. with={{ modelName1_modelName2 }} - get document with specified models separated with "_". Model should be related to the collection, otherwise they will be ignored
2. all - get document with all related models

## Read many
1. search={{ search_query }} - find models with specified search query. Query examples:
    
    - name="Pekka" - name equals Pekka
    - name="Pek." - name starts with Pek
    - age=23 - age equals 23
    - age>23 - age more than 23
    - age>=23 - age more or equals 23
    - age<23 - age less than 23
    - age<=23 - age is less or equals 23
    - name="Pekka";AND;age=23 - name equals Pekka and age equals 23
    - name="Pek.";OR;age>23 - name starts with Pek or age less than 23
    - age=23;OR;name="Pek.";AND;age<23 - age equals to 23 or (name starts with Pek and age less than 23)

2. limit={{max_number_of_returned_elements}} - maximum number of elements can be returned at once = on one page
3. page = {{ page_number }} - which page to return. If where are found more elements than max amount the API is set to return at once, response data will be divided into the same size chunks - pages.
4. withPageCount - return information about total items and page count found with the query. By default, this info is returned only on first page.
5. sort={{ field_name }} - sort by specified collection's field name. By default, it is an increasing order, desc query can be added for decreasing order.
6. desc - set sort order to a decreasing
