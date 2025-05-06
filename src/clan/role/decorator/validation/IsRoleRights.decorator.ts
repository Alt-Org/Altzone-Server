import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { areRoleRightsValid } from './validators';

export default function IsRoleRights(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      propertyName,
      name: IsRoleRights.name,
      target: object.constructor,
      options: validationOptions,
      validator: IsRoleRightsConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
class IsRoleRightsConstraint implements ValidatorConstraintInterface {
  validate(rights: any, _args: ValidationArguments) {
    return areRoleRightsValid(rights);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Provided clan role rights are not valid';
  }
}
