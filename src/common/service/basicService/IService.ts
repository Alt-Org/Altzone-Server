import { ModelName } from "src/common/enum/modelName.enum";
import ServiceError from "./ServiceError";
import { FilterQuery } from "mongoose";

/**
 * Currently not in use
 */
export type TIServiceCreateOneOptions = {}
/**
 * Currently not in use
 */
export type TIServiceCreateManyOptions = {}

export type TReadByIdOptions = {
    /**
     * Specifies which fields of the requested object to include.
     *
     * By default, all fields will be included.
     *
     * @example ['_id', 'username']
     */
    select?: string[],

    /**
     * Specifies what other related objects to include as nested.
     *
     * Notice that only objects (aka Mongo collections) directly related to the object and registered in the DB schema can be used; otherwise, an error will be returned.
     *
     * For example, a Player can be joined to a Clan and has a clan_id field, which specifies to what Clan the Player belongs.
     * In this case, you can add 'Clan' to the array, and the Clan field with its data will be added as a nested object:
     * ```
     * {
     *   _id: '668d6003a9292e300e94c833',
     *   name: 'John Doe' ...etc,
     *   Clan: { _id: '665df7026bf5b8f670569ea4', ...etc }
     * }
     * ```
     * @example [ModelName.CLAN]
     */
    includeRefs?: ModelName[]
}

export type TIServiceReadOneOptions<TObject = any> = {
    /**
     * Search condition to apply.
     *
     * Typically, the filter is a unique field in the collection, such as username, email, etc.
     *
     * Notice that the first object found in the DB will be returned even if multiple objects are found.
     *
     * @example ```
     *  //Equals
     *  {username: 'john'} //find an object where the username field is equal to 'john'
     * ```
     * @example ```
     * //AND
     *  {username: 'john', name: 'John Doe'} //find an object where the username field is equal to 'john' AND the name is equal to 'John Doe'
     * ```
     * @example ```
     * //OR
     *  [{username: 'john'}, {name: 'John Doe'}] //find an object where the username field is equal to 'john' OR the name is equal to 'John Doe'
     * ```
     * @example ```
     * //Operators, all MongoDB operators, most common ones: $gte, $gt, $lte, $lt, $in, $regex
     *  {age: {$gte: 23}} //find an object where the age field is greater than or equal to 23
     * ```
     * @see [MongoDB queries](https://www.mongodb.com/docs/manual/reference/operator/query/)
     */
    filter: FilterQuery<TObject> | FilterQuery<TObject>[],

    /**
     * Specifies which fields of the requested object to include.
     *
     * By default, all fields will be included.
     *
     * @example ['_id', 'username']
     */
    select?: string[],

    /**
     * Specifies what other related objects to include as nested.
     *
     * Notice that only objects (aka Mongo collections) directly related to the object and registered in the DB schema can be used; otherwise, an error will be returned.
     *
     * For example, a Player can be joined to a Clan and has a clan_id field, which specifies to what Clan the Player belongs.
     * In this case, you can add 'Clan' to the array, and the Clan field with its data will be added as a nested object:
     * ```
     * {
     *   _id: '668d6003a9292e300e94c833',
     *   name: 'John Doe' ...etc,
     *   Clan: { _id: '665df7026bf5b8f670569ea4', ...etc }
     * }
     * ```
     * @example [ModelName.CLAN]
     */
    includeRefs?: ModelName[]
}

export type TIServiceReadManyOptions<TObject = any> = {
    /**
     * Search condition to apply.
     *
     * @example ```
     *  //Equals
     *  {username: 'john'} //find all objects where the username field is equal to 'john'
     * ```
     * @example ```
     * //AND
     *  {username: 'john', name: 'John Doe'} //find all objects where the username field is equal to 'john' AND the name is equal to 'John Doe'
     * ```
     * @example ```
     * //OR
     *  [{username: 'john'}, {name: 'John Doe'}] //find all objects where the username field is equal to 'john' OR the name is equal to 'John Doe'
     * ```
     * @example ```
     * //Operators, all MongoDB operators, most common ones: $gte, $gt, $lte, $lt, $in, $regex
     *  {age: {$gte: 23}} //find all objects where the age field is greater than or equal to 23
     * ```
     * @see [MongoDB queries](https://www.mongodb.com/docs/manual/reference/operator/query/)
     */
    filter?: FilterQuery<TObject> | FilterQuery<TObject>[],

    /**
     * Specifies which fields of the requested objects to include.
     *
     * By default, all fields will be included.
     *
     * @example ['_id', 'username']
     */
    select?: string[],

    /**
     * The maximum number of objects to be returned.
     *
     * @example 20
     */
    limit?: number,

    /**
     * Sorting order based on field(s). Value -1 for descending (from 10-1 or Z-A) and value 1 for ascending (1-10 or A-Z).
     * @example ```
     * {username: 1} //Sort by usernames from A to Z
     * {username: 1, age: -1} //Sort by usernames from A to Z AND age from 100 to 1
     * ```
     */
    sort?: Record<string, 1 | -1>,

    /**
     * Specifies how many objects to skip from the start. Usually used for offset pagination with the _limit_ option.
     * @example 5
     * @see [Types of pagination](https://www.golinuxcloud.com/paginate-with-mongoose-in-node-js/)
     */
    skip?: number,

    /**
     * Specifies what other related objects to include as nested.
     * 
     * Notice that only objects (aka Mongo collections) directly related to the object and registered in the DB schema can be used; otherwise, an error will be returned.
     *
     * For example, a Player can be joined to a Clan and has a clan_id field, which specifies to what Clan the Player belongs.
     * In this case, you can add 'Clan' to the array, and the Clan field with its data will be added as a nested object:
     * ```
     * {
     *   _id: '668d6003a9292e300e94c833',
     *   name: 'John Doe' ...etc,
     *   Clan: { _id: '665df7026bf5b8f670569ea4', ...etc }
     * }
     * ```
     * @example [ModelName.CLAN]
     */
    includeRefs?: ModelName[]
}

/**
 * Currently not in use
 */
export type TIServiceUpdateByIdOptions = {}

export type TIServiceUpdateOneOptions<TObject = any> = {
    /**
     * Search condition to apply. Update only the object that satisfies this condition.
     *
     * Typically, the filter is a unique field in the collection, such as username, email, etc.
     *
     * Notice that the first object found in the DB will be updated even if multiple objects are found.
     *
     * @example ```
     *  //Equals
     *  {username: 'john'} //update an object where the username field is equal to 'john'
     * ```
     * @example ```
     * //AND
     *  {username: 'john', name: 'John Doe'} //update an object where the username field is equal to 'john' AND the name is equal to 'John Doe'
     * ```
     * @example ```
     * //OR
     *  [{username: 'john'}, {name: 'John Doe'}] //update an object where the username field is equal to 'john' OR the name is equal to 'John Doe'
     * ```
     * @example ```
     * //Operators, all MongoDB operators, most common ones: $gte, $gt, $lte, $lt, $in, $regex
     *  {age: {$gte: 23}} //update an object where the age field is greater than or equal to 23
     * ```
     * @see [MongoDB queries](https://www.mongodb.com/docs/manual/reference/operator/query/)
     */
    filter: FilterQuery<TObject> | FilterQuery<TObject>[]
}

export type TIServiceUpdateManyOptions<TObject = any> = {
    /**
     * Search condition to apply. Update only objects that satisfy the condition.
     *
     * @example ```
     *  //Equals
     *  {username: 'john'} //update all objects where the username field is equal to 'john'
     * ```
     * @example ```
     * //AND
     *  {username: 'john', name: 'John Doe'} //update all objects where the username field is equal to 'john' AND the name is equal to 'John Doe'
     * ```
     * @example ```
     * //OR
     *  [{username: 'john'}, {name: 'John Doe'}] //update all objects where the username field is equal to 'john' OR the name is equal to 'John Doe'
     * ```
     * @example ```
     * //Operators, all MongoDB operators, most common ones: $gte, $gt, $lte, $lt, $in, $regex
     *  {age: {$gte: 23}} //update all objects where the age field is greater than or equal to 23
     * ```
     * @see [MongoDB queries](https://www.mongodb.com/docs/manual/reference/operator/query/)
     */
    filter: FilterQuery<TObject> | FilterQuery<TObject>[]
}

/**
 * Currently not in use
 */
export type TIServiceDeleteByIdOptions = {}

export type TIServiceDeleteOneOptions<TObject = any> = {
    /**
     * Search condition to apply. Delete only the object that satisfies this condition.
     *
     * Typically, the filter is a unique field in the collection, such as username, email, etc.
     *
     * Notice that the first object found in the DB will be deleted even if multiple objects are found.
     *
     * @example ```
     *  //Equals
     *  {username: 'john'} //delete an object where the username field is equal to 'john'
     * ```
     * @example ```
     * //AND
     *  {username: 'john', name: 'John Doe'} //delete an object where the username field is equal to 'john' AND the name is equal to 'John Doe'
     * ```
     * @example ```
     * //OR
     *  [{username: 'john'}, {name: 'John Doe'}] //delete an object where the username field is equal to 'john' OR the name is equal to 'John Doe'
     * ```
     * @example ```
     * //Operators, all MongoDB operators, most common ones: $gte, $gt, $lte, $lt, $in, $regex
     *  {age: {$gte: 23}} //delete an object where the age field is greater than or equal to 23
     * ```
     * @see [MongoDB queries](https://www.mongodb.com/docs/manual/reference/operator/query/)
     */
    filter: FilterQuery<TObject> | FilterQuery<TObject>[]
}

export type TIServiceDeleteManyOptions<TObject = any> = {
    /**
     * Search condition to apply. Delete only objects that satisfy the condition.
     *
     * @example ```
     *  //Equals
     *  {username: 'john'} //delete all objects where the username field is equal to 'john'
     * ```
     * @example ```
     * //AND
     *  {username: 'john', name: 'John Doe'} //delete all objects where the username field is equal to 'john' AND the name is equal to 'John Doe'
     * ```
     * @example ```
     * //OR
     *  [{username: 'john'}, {name: 'John Doe'}] //delete all objects where the username field is equal to 'john' OR the name is equal to 'John Doe'
     * ```
     * @example ```
     * //Operators, all MongoDB operators, most common ones: $gte, $gt, $lte, $lt, $in, $regex
     *  {age: {$gte: 23}} //delete all objects where the age field is greater than or equal to 23
     * ```
     * @see [MongoDB queries](https://www.mongodb.com/docs/manual/reference/operator/query/)
     */
    filter: FilterQuery<TObject> | FilterQuery<TObject>[]
}

/**
 * Interface for a service class, which provides all basic operations with DB.
 * 
 * Notice that the class implementing the interface should not throw any errors but return them as a ServiceError array instead.
 */
export interface IService {
    /**
     * Add the specified object to the DB.
     * @param input - The object to add.
     * @param options - Options for the request.
     * @returns The added object to the DB with the _id field or a ServiceError array if something went wrong.
     */
    createOne<TInput=any, TOutput=any>(input: TInput, options?: TIServiceCreateOneOptions): Promise<TOutput | ServiceError[]>;

    /**
     * Add the specified objects to the DB.
     * @param input - An array of objects to add.
     * @param options - Options for the request.
     * @returns An array of added objects to the DB with _id fields or a ServiceError array if something went wrong.
     */
    createMany<TInput=any, TOutput=any>(input: TInput[], options?: TIServiceCreateManyOptions): Promise<TOutput | ServiceError[]>;

    /**
     * Find an object in the DB by its _id field.
     * @param _id - The Mongo _id of the object.
     * @param options - Options for the request.
     * @returns The found object or a ServiceError array if it was not found or something else went wrong.
     */
    readOneById<TOutput=any>(_id: string, options?: TReadByIdOptions): Promise<TOutput | ServiceError[]>;

    /**
     * Find one object in the DB by the specified condition.
     *
     * Can be used, for example, to find an object by some unique field such as "username".
     * @param options - Options for the request.
     * @returns The found object or a ServiceError array if it was not found or something else went wrong.
     */
    readOne<TOutput=any>(options: TIServiceReadOneOptions): Promise<TOutput | ServiceError[]>;

    /**
     * Find all objects in the DB.
     * @param options - Options for the request.
     * @returns An array of found objects or a ServiceError array if none were found or something else went wrong.
     */
    readMany<TOutput=any>(options?: TIServiceReadManyOptions): Promise<TOutput[] | ServiceError[]>;

    /**
     * Update an object in the DB by its _id field.
     * @param _id - The Mongo _id of the object.
     * @param input - The object with fields to be changed.
     * @param options - Options for the request.
     * @returns _true_ if it was updated successfully, _false_ if nothing was updated for the object, or a ServiceError array if it was not found or something else went wrong.
     */
    updateOneById<TInput=any>(_id: string, input: TInput, options?: TIServiceUpdateByIdOptions): Promise<boolean | ServiceError[]>;

    /**
     * Update one object in the DB by the specified condition.
     *
     * Can be used, for example, to update an object by some unique field such as "username".
     * @param input - The object with fields to be changed.
     * @param options - Options for the request.
     * @returns _true_ if it was updated successfully, _false_ if nothing was updated for the object, or a ServiceError array if it was not found or something else went wrong.
     */
    updateOne<TInput=any>(input: TInput, options: TIServiceUpdateOneOptions): Promise<boolean | ServiceError[]>;

    /**
     * Update multiple objects in the DB at once by the specified condition.
     * @param input - An array of objects with fields to be changed.
     * @param options - Options for the request.
     * @returns _true_ if the objects were updated successfully, _false_ if nothing was updated for the objects, or a ServiceError array if none were found or something else went wrong.
     */
    updateMany<TInput=any>(input: TInput[], options: TIServiceUpdateManyOptions): Promise<boolean | ServiceError[]>;

    /**
     * Remove an object by its _id field from the DB.
     * @param _id - The Mongo _id of the object.
     * @param options - Options for the request.
     * @returns _true_ if it was removed successfully, or a ServiceError array if it was not found or something else went wrong.
     */
    deleteOneById(_id: string, options?: TIServiceDeleteByIdOptions): Promise<true | ServiceError[]>;

    /**
     * Remove one object from the DB by the specified condition.
     *
     * Can be used, for example, to remove an object by some unique field such as "username".
     * @param options - Options for the request.
     * @returns _true_ if it was removed successfully, or a ServiceError array if it was not found or something else went wrong.
     */
    deleteOne(options: TIServiceDeleteOneOptions): Promise<true | ServiceError[]>;

    /**
     * Remove multiple objects at once from the DB by the specified condition.
     * @param options - Options for the request.
     * @returns _true_ if the objects were removed successfully, or a ServiceError array if none were found or something else went wrong.
     */
    deleteMany(options: TIServiceDeleteManyOptions): Promise<true | ServiceError[]>;
}