import {UnauthorizedException} from "@nestjs/common";

export const ThrowAuthErrorIfFound = (): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]){
            const result = originalMethod.apply(this, args);

            if(result instanceof Promise){
                return result.then(resp => {
                    return handler(resp);
                });
            }

            return handler(result);
        }

        return descriptor;
    }
}

function handler(resp: any) {
    if(resp === null)
        throw new UnauthorizedException('Credentials for that profile are incorrect');
    return resp;
}