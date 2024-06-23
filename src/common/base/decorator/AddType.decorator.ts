export interface ObjectType {
    objectType: string;
    isType: (type: string) => boolean;
}

/**
 * Add objectType to the class for later comparisons
 * @param type class objectType field to be added
 */
export default function AddType(type: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor implements ObjectType {
            objectType = type;
            
            isType(compareType: string): boolean {
                return this.objectType === compareType;
            }
        }
    };
}

