import { Error } from 'mongoose';
import { convertMongooseToServiceErrors } from '../../../../../common/service/basicService/BasicService';
import { SEReason } from '../../../../../common/service/basicService/SEReason';

describe('BasicService convertMongooseToServiceErrors() test suite', () => {
  it('Should return ServiceError MISCONFIGURED if param is null or undefined', () => {
    const result = convertMongooseToServiceErrors(null);
    expect(result).toHaveLength(1);
    expect(result).toContainSE_MISCONFIGURED();
  });

  it('Should return ServiceError NOT_UNIQUE if param is mongoose not unique field error', () => {
    const mongooseError = {
      code: 11000,
      keyPattern: { email: 1 },
      keyValue: { email: 'test@example.com' },
    };

    const result = convertMongooseToServiceErrors(mongooseError);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.NOT_UNIQUE,
        field: 'email',
        value: 'test@example.com',
        message: 'Field "email" with value "test@example.com" already exists',
      }),
    );
  });

  it('Should return ServiceError NOT_ALLOWED if param is mongoose StrictPopulateError error', () => {
    const mongooseError = {
      name: 'StrictPopulateError',
      path: 'player',
    };

    const result = convertMongooseToServiceErrors(mongooseError);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.NOT_ALLOWED,
        field: 'includeRefs',
      }),
    );
  });

  it('Should return ServiceError with appropriate reason if param is mongoose ValidationError error', () => {
    const mongooseError = new Error.ValidationError(null);
    mongooseError.errors = {
      name: {
        message: 'Name is required',
        kind: 'required',
        path: 'name',
        value: undefined,
      },
      age: {
        message: 'Age must be a number',
        kind: 'number',
        path: 'age',
        value: 'twenty',
      },
    } as any;

    const result = convertMongooseToServiceErrors(mongooseError);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.REQUIRED,
        field: 'name',
        message: 'Name is required',
      }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        reason: SEReason.NOT_NUMBER,
        field: 'age',
        message: 'Age must be a number',
        value: 'twenty',
      }),
    );
  });

  it('Should return ServiceError with appropriate reason if param is mongoose CastError error', () => {
    const mongooseError = new Error.CastError('enum', 'some-value', 'labels');

    const result = convertMongooseToServiceErrors(mongooseError);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.WRONG_ENUM,
        field: mongooseError.path,
        message: mongooseError.message,
      }),
    );
  });

  it('Should return ServiceError NOT_FOUND if param is mongoose DocumentNotFoundError error', () => {
    const mongooseError = new Error.DocumentNotFoundError('Document not found');

    const result = convertMongooseToServiceErrors(mongooseError);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.NOT_FOUND,
        message: mongooseError.message,
      }),
    );
  });

  it('Should return ServiceError UNEXPECTED if param is any other error', () => {
    const genericError = { message: 'Some unexpected error', name: 'Error' };

    const result = convertMongooseToServiceErrors(genericError);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.UNEXPECTED,
        message: 'Can not convert the JS Error to ServiceError',
        additional: {
          ...genericError,
          message: genericError?.message,
          name: genericError.name,
        },
      }),
    );
  });

  it('Should return ServiceError UNEXPECTED if param is empty object', () => {
    const result = convertMongooseToServiceErrors({});

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        reason: SEReason.UNEXPECTED,
        message: 'Can not convert the error from Mongoose to Service',
      }),
    );
  });
});
