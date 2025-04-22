import { registerDecorator } from 'class-validator';
import { registerValidationDecorator } from '../../../../common/decorator/validation/registerValidationDecorator';

jest.mock('class-validator', () => ({
  registerDecorator: jest.fn(),
}));

describe('registerValidationDecorator() test suite', () => {
  it('Should call registerDecorator() with valid arguments', () => {
    const decoratorName = 'myDecorator';
    const validatorFunction = () => true;
    const object = Error;
    const propertyName = 'myProperty';
    const validationOptions = {};

    registerValidationDecorator(
      decoratorName,
      validatorFunction,
      object,
      propertyName,
      validationOptions,
    );

    expect(registerDecorator).toHaveBeenCalledWith({
      name: decoratorName,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: validatorFunction,
    });
  });
});
