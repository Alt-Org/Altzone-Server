import {registerDecorator, ValidationOptions, ValidatorConstraintInterface} from "class-validator";

export function registerValidationDecorator (
    decoratorName: string,
    validatorFunction: Function | ValidatorConstraintInterface,
    object: any,
    propertyName: string,
    validationOptions?: ValidationOptions
    ) {
    registerDecorator({
        name: decoratorName,
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: validatorFunction,
    });
}