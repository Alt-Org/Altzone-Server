export const Serialize = (include: string[]): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);

            if (result && result instanceof Promise) {
                return result.then((data) => {
                    return sanitize(data, include);
                });
            }

            return sanitize(result, include);
        };

        return descriptor;
    };
};

function sanitize(data: any, include: string[]) {
    if(data && typeof data === 'object' && !Array.isArray(data)){
        return sanitizeObject(data, include);
    }

    if(Array.isArray(data)){
        const result = [];
        for(let i=0; i<data.length; i++)
            result[i] = sanitizeObject(data[i], include);

        return result;
    }

    return data;
}

function sanitizeObject(data: object, include: string[]) {
    let result = {};
    for(let i=0; i<include.length; i++){
        const field = include[i];
        result[field] = data[field];
    }

    return result;
}