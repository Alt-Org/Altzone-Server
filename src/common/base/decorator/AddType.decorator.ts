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
        return new Proxy(constructor, {
            construct(target, args) {
                const instance = new target(...args) as ObjectType;
                instance.objectType = type;
                instance.isType = function (compareType: string): boolean {
                    return this.objectType === compareType;
                };
                return instance;
            },
            apply(target, thisArg, argumentsList) {
                const instance = target.apply(thisArg, argumentsList);
                if (instance && typeof instance === 'object') {
                    instance.objectType = type;
                    instance.isType = function (compareType: string): boolean {
                        return this.objectType === compareType;
                    };
                }
                return instance;
            }
        });
    };
}

