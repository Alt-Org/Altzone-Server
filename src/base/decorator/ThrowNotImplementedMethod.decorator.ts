export const ThrowNotImplementedMethod = (className: string): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = function () {
            const notImplementedError = new Error(
                `You are trying to use ${propertyKey}() of ${className} class, which does implement any methods by itself.\n` +
                `You have to implement the method yourself or use the @AddBaseService() with a class, you are extending with ${className} class`
            );

            return Promise.reject(() => { throw notImplementedError});
        };

        return descriptor;
    };
};