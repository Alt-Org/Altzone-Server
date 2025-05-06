import {
  isMongoId,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsMongoIdOrNull(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      propertyName,
      name: IsMongoIdOrNull.name,
      target: object.constructor,
      options: validationOptions,
      validator: IsMongoIdOrNullConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
class IsMongoIdOrNullConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return value === null || isMongoId(value);
  }

  defaultMessage(_args: ValidationArguments) {
    return _args.property + ' must be a mongodb id or null';
  }
}
