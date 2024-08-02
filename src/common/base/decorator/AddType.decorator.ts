/**
 * Constant, which determines the field used to determine the type of the object
 */
export const OBJECT_TYPE_FIELD = 'objectType';

/**
 * Interface can be used together with AddType decorator to add the objectType field and isType() function for TS
 */
export interface ObjectType {
    [OBJECT_TYPE_FIELD]: string;
    isType: (type: string) => boolean;
}

/**
 * Add objectType to the class for comparisons as well as isType(), which can determine whenever the object is right type or not
 *
 * In case you want to use the objectType and isType() inside the API code, please add this two statements to your class:
 * - declare objectType: string;
 * - declare isType: (type: string) => boolean;
 * @param type class objectType field to be added
 */
export default function AddType(type: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return ObjectTypeMixin(constructor, type);
    }
}

function ObjectTypeMixin<T extends { new(...args: any[]): {} }>(Base: T, type: string) {
    return class extends Base implements ObjectType {
        [OBJECT_TYPE_FIELD] = type;
        isType(compareType: string): boolean {
            return this[OBJECT_TYPE_FIELD] === compareType;
        }
    };
}