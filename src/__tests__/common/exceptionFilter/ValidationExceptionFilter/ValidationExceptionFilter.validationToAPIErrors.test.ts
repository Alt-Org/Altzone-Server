import { APIErrorReason } from '../../../../common/controller/APIErrorReason';
import { validationToAPIErrors } from '../../../../common/exceptionFilter/ValidationExceptionFilter';
import TestUtilDataFactory from '../../../test_utils/data/TestUtilsDataFactory';

describe('ValidationExceptionFilter.validationToAPIErrors() class test suite', () => {
  const validationErrorBuilder =
    TestUtilDataFactory.getBuilder('ValidationError');
  const apiErrorBuilder = TestUtilDataFactory.getBuilder('APIError');

  it('Should convert valid validationError to appropriate APIError', () => {
    const validationError = validationErrorBuilder
      .addConstraint('isBoolean', 'The value must be of boolean type')
      .setProperty('name')
      .setValue('hello')
      .build();

    const expectedError = apiErrorBuilder
      .setMessage('The value must be of boolean type')
      .setField('name')
      .setValue('hello')
      .setAdditional('isBoolean')
      .setReason(APIErrorReason.NOT_BOOLEAN)
      .build();

    const result = validationToAPIErrors(validationError);

    expect(result[0]).toEqual(expectedError);
  });

  it('Should convert validationError with unknown constraint to NOT_ALLOWED APIError', () => {
    const validationError = validationErrorBuilder
      .setProperty('name')
      .setValue('hello')
      .build();

    const unknownError = {
      ...validationError,
      constraints: {
        isBoolean_String: 'The value must be of BooleanString type',
      },
    };

    const expectedError = apiErrorBuilder
      .setMessage('The value must be of BooleanString type')
      .setField('name')
      .setValue('hello')
      .setAdditional('isBoolean_String')
      .setReason(APIErrorReason.NOT_ALLOWED)
      .build();

    const result = validationToAPIErrors(unknownError);

    expect(result[0]).toEqual(expect.objectContaining(expectedError));
  });

  it('Should convert multiple validationErrors to appropriate APIErrors', () => {
    const validationErrors = validationErrorBuilder
      .addConstraint('isBoolean', 'The value must be of boolean type')
      .addConstraint('isEnum', 'The value must have one of the enum values')
      .setProperty('name')
      .setValue('hello')
      .build();

    const expectedError1 = apiErrorBuilder
      .setMessage('The value must be of boolean type')
      .setField('name')
      .setValue('hello')
      .setAdditional('isBoolean')
      .setReason(APIErrorReason.NOT_BOOLEAN)
      .build();

    const expectedError2 = apiErrorBuilder
      .setMessage('The value must have one of the enum values')
      .setField('name')
      .setValue('hello')
      .setAdditional('isEnum')
      .setReason(APIErrorReason.WRONG_ENUM)
      .build();

    const result = validationToAPIErrors(validationErrors);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(expectedError1),
        expect.objectContaining(expectedError2),
      ]),
    );
  });
});
