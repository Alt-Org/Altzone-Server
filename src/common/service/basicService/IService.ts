import { ModelName } from "src/common/enum/modelName.enum";
import ServiceError from "./ServiceError";


export type TIServiceCreateOneOptions = {

}
export type TIServiceCreateManyOptions = {

}
export type TReadByIdOptions = {
    select?: string[],
    includeRefs?: ModelName[]
}
export type TIServiceReadOneOptions = {
    filter: object,
    select?: string[],
    includeRefs?: ModelName[]
}
export type TIServiceReadManyOptions = {
    filter?: object,
    select?: string[],
    limit?: number,
    sort?: Record<string, 1 | -1>,
    skip?: number,
    includeRefs?: ModelName[]
}

export type TIServiceUpdateByIdOptions = {
    
}
export type TIServiceUpdateOneOptions = {
    filter: object
}
export type TIServiceUpdateManyOptions = {
    filter: object
}

export type TIServiceDeleteByIdOptions = {

}
export type TIServiceDeleteOneOptions = {
    filter: object
}
export type TIServiceDeleteManyOptions = {

}

/**
 * Interface for a service class, which provides all basic operations with DB.
 * 
 * Notice that the class implementing the interface should not throw any errors but return them as a ServiceError array instead.
 */
export interface IService<TReadReturn=any, TCreateReturn=any> {
    /**
     * Add the specified object to the DB.
     * @param input - The object to add.
     * @param options - Options for the request.
     * @returns The added object to the DB with the _id field or a ServiceError array if something went wrong.
     */
    createOne(input: any, options?: TIServiceCreateOneOptions): Promise<TCreateReturn | ServiceError[]>;

    /**
     * Add the specified objects to the DB.
     * @param input - An array of objects to add.
     * @param options - Options for the request.
     * @returns An array of added objects to the DB with _id fields or a ServiceError array if something went wrong.
     */
    createMany(input: any[], options?: TIServiceCreateManyOptions): Promise<TCreateReturn | ServiceError[]>;

    /**
     * Find an object in the DB by its _id field.
     * @param _id - The ID of the object.
     * @param options - Options for the request.
     * @returns The found object or a ServiceError array if it was not found or something else went wrong.
     */
    readOneById(_id: string, options?: TReadByIdOptions): Promise<TReadReturn | ServiceError[]>;

    /**
     * Find one object in the DB by the specified condition.
     *
     * Can be used, for example, to find an object by some unique field such as "username".
     * @param options - Options for the request.
     * @returns The found object or a ServiceError array if it was not found or something else went wrong.
     */
    readOne(options: TIServiceReadOneOptions): Promise<TReadReturn | ServiceError[]>;

    /**
     * Find all objects in the DB.
     * @param options - Options for the request.
     * @returns An array of found objects or a ServiceError array if none were found or something else went wrong.
     */
    readMany(options?: TIServiceReadManyOptions): Promise<TReadReturn[] | ServiceError[]>;

    /**
     * Update an object in the DB by its _id field.
     * @param _id - The ID of the object.
     * @param input - The object with fields to be changed.
     * @param options - Options for the request.
     * @returns _true_ if it was updated successfully, _false_ if nothing was updated for the object, or a ServiceError array if it was not found or something else went wrong.
     */
    updateOneById(_id: string, input: any, options?: TIServiceUpdateByIdOptions): Promise<boolean | ServiceError[]>;

    /**
     * Update one object in the DB by the specified condition.
     *
     * Can be used, for example, to update an object by some unique field such as "username".
     * @param input - The object with fields to be changed.
     * @param options - Options for the request.
     * @returns _true_ if it was updated successfully, _false_ if nothing was updated for the object, or a ServiceError array if it was not found or something else went wrong.
     */
    updateOne(input: any, options: TIServiceUpdateOneOptions): Promise<boolean | ServiceError[]>;

    /**
     * Update multiple objects in the DB at once by the specified condition.
     * @param input - An array of objects with fields to be changed.
     * @param options - Options for the request.
     * @returns _true_ if the objects were updated successfully, _false_ if nothing was updated for the objects, or a ServiceError array if none were found or something else went wrong.
     */
    updateMany(input: any[], options: TIServiceUpdateManyOptions): Promise<boolean | ServiceError[]>;

    /**
     * Remove an object by its _id field from the DB.
     * @param _id - The ID of the object.
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