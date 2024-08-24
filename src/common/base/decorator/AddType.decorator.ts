/**
 * Constant, which determines the field used to determine the type of the object
 */
export const OBJECT_TYPE_FIELD = 'objectType';

/**
 * Interface can be used together with AddType decorator to add the objectType field
 */
export interface ObjectType {
    [OBJECT_TYPE_FIELD]: string;
}

/**
 * Add objectType to the class for comparisons as well as isType(), which can determine whenever the object is right type or not
 *
 * @param type class objectType field to be added
 */
export default function AddType(type: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            objectType = type;
    
            constructor(...args: any[]) {
                super(...args);
                Object.assign(this, { objectType: type });
            }
        };
    }
}

/**
 * Determines whenever the object is of specified type or not
 *
 * Notice that it will return false for null objects and for objects, which does not have the objectType field
 * @param obj to check
 * @param type 
 * @returns _true_ if objectType field is equal to the type parameter or _false_ if not
 */
export function isType(obj: any, type: string){
    if(!obj || !obj[OBJECT_TYPE_FIELD])
        return false;

    return obj[OBJECT_TYPE_FIELD] === type;
}