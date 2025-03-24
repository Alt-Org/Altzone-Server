import { APIError } from '../../../../common/controller/APIError';
import { APIErrorReason } from '../../../../common/controller/APIErrorReason';

describe('APIError test suite', () => {
  it('Should set default values when no arguments are provided', () => {
    const error = new APIError({});

    expect(error).toEqual(
      expect.objectContaining({
        reason: APIErrorReason.UNEXPECTED,
        statusCode: 500,
        message: null,
        field: null,
        value: null,
        additional: null,
      }),
    );
  });

  it('Should set the status code to a valid status', () => {
    const error = new APIError({ statusCode: 400 });
    expect(error.statusCode).toBe(400);
  });

  it('Should set status code to 500 if invalid status is provided', () => {
    const error = new APIError({ statusCode: 999 });
    expect(error.statusCode).toBe(500);
  });

  it('Should determine status based on reason', () => {
    const error = new APIError({ reason: APIErrorReason.NOT_AUTHORIZED });
    expect(error.statusCode).toBe(403);
  });

  it('Should set custom message, field, value, and additional properties', () => {
    const message = 'Custom error message';
    const field = 'name';
    const value = 23;
    const additional = { additional: 'object' };
    const error = new APIError({
      message,
      field,
      value,
      additional,
    });

    expect(error).toEqual(
      expect.objectContaining({
        message,
        field,
        value,
        additional,
      }),
    );
  });
});
