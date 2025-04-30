import { registerDecorator,
   ValidationArguments,
   ValidationOptions, 
   ValidatorConstraint, 
   ValidatorConstraintInterface } from 'class-validator';

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
    
    const mongoIdRegexPattern = /^[a-f\d]{24}$/i;

    if (value === null) return true;
    if (Array.isArray(value)) {
      return value.every((item) => item == null || mongoIdRegexPattern.test(item));
    }
    return mongoIdRegexPattern.test(value);
  }

  defaultMessage(_args: ValidationArguments) {
    return _args.property + ' must be a mongodb id or null';
  }
}