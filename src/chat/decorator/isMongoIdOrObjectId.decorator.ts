import { registerDecorator, ValidationOptions } from 'class-validator';
import { ObjectId } from 'mongodb';

export function IsMongoIdOrObjectId(options?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMongoIdOrObjectId',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          if (value instanceof ObjectId) return true;

          return (
            typeof value === 'string' &&
            ObjectId.isValid(value)
          );
        },
      },
    });
  };
}