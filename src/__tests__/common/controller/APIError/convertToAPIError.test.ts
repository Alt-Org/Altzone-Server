import {
  APIError,
  convertToAPIError,
} from '../../../../common/controller/APIError';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';

describe('convertToAPIError() test suite', () => {
  it('Should convert ServiceError to APIError', () => {
    const serviceError = new ServiceError({
      reason: SEReason.LESS_THAN_MIN,
      message: 'field can not be less than 5',
    });
    const result = convertToAPIError(serviceError);

    expect(result).toBeInstanceOf(APIError);
    expect(result.message).toBe(serviceError.message);
    expect(result.statusCode).toBe(400);
  });

  it('Should convert APIError to APIError', () => {
    const apiError = new APIError({});
    const result = convertToAPIError(apiError);

    expect(result).toBe(apiError);
  });

  it('Should put not supported error to the additional field', () => {
    const someError = new Error('Some unexpected error');
    const result = convertToAPIError(someError);

    expect(result).toBeInstanceOf(APIError);
    expect(result.additional).toBe(someError);
  });
});
