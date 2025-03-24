import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';

export function registerValidationDecorator(
  decoratorName: string,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  validatorFunction: Function | ValidatorConstraintInterface,
  object: any,
  propertyName: string,
  validationOptions?: ValidationOptions,
) {
  registerDecorator({
    name: decoratorName,
    target: object.constructor,
    propertyName: propertyName,
    options: validationOptions,
    validator: validatorFunction,
  });
}
