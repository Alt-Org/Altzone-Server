import { CallHandler, ExecutionContext, HttpException } from '@nestjs/common';
import { of } from 'rxjs';
import { ModelName } from '../../../../../common/enum/modelName.enum';
import ClanBuilderFactory from '../../../../clan/data/clanBuilderFactory';
import { FormatAPIResponseInterceptor } from '../../../../../common/interceptor/response/FormatAPIResponse';
import formatResponse from '../../../../../common/controller/formatResponse';
import {
  APIError,
  convertToAPIError,
} from '../../../../../common/controller/APIError';
import { APIErrorReason } from '../../../../../common/controller/APIErrorReason';
import ServiceError from '../../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../../common/service/basicService/SEReason';

jest.mock('../../../../../common/controller/formatResponse');

describe('FormatAPIResponseInterceptor.intercept() test suite', () => {
  const modelName = ModelName.CLAN;
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  let interceptor: FormatAPIResponseInterceptor;
  let callHandler: CallHandler;
  let executionContext: ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new FormatAPIResponseInterceptor(modelName);
    callHandler = {
      handle: jest.fn(),
    };
    executionContext = {} as ExecutionContext;
  });

  it('Should format valid returned data', async () => {
    const clan = clanBuilder.build();
    (formatResponse as jest.Mock).mockReturnValue({ data: clan });

    (callHandler.handle as jest.Mock).mockReturnValue(of(clan));

    const result = await interceptor
      .intercept(executionContext, callHandler)
      .toPromise();

    expect(formatResponse).toHaveBeenCalledWith(clan, modelName);
    expect(result).toEqual({ data: clan });
  });

  it('Should handle tuple [data, null] and format it', async () => {
    const clan = clanBuilder.build();
    (formatResponse as jest.Mock).mockReturnValue({ data: clan });

    (callHandler.handle as jest.Mock).mockReturnValue(of([clan, null]));

    const result = await interceptor
      .intercept(executionContext, callHandler)
      .toPromise();

    expect(formatResponse).toHaveBeenCalledWith(clan, modelName);
    expect(result).toEqual({ data: clan });
  });

  it('Should throw APIError from tuple [null, error]', async () => {
    const apiError = new APIError({
      message: 'bad',
      reason: APIErrorReason.BAD_REQUEST,
    });

    (callHandler.handle as jest.Mock).mockReturnValue(of([null, apiError]));

    await expect(
      interceptor.intercept(executionContext, callHandler).toPromise(),
    ).rejects.toThrow(HttpException);

    try {
      await interceptor.intercept(executionContext, callHandler).toPromise();
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getResponse()).toBe('BAD_REQUEST');
      expect(err.getStatus()).toBe(apiError.statusCode);
    }
  });

  it('Should throw when ServiceError is returned', async () => {
    const serviceError = new ServiceError({ reason: SEReason.NOT_BOOLEAN });
    const expectedApiError = convertToAPIError(serviceError);

    (callHandler.handle as jest.Mock).mockReturnValue(of(serviceError));

    await expect(
      interceptor.intercept(executionContext, callHandler).toPromise(),
    ).rejects.toThrow(HttpException);

    try {
      await interceptor.intercept(executionContext, callHandler).toPromise();
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getResponse()).toEqual({
        errors: expect.arrayContaining([expectedApiError]),
        statusCode: expectedApiError.statusCode,
      });
    }
  });

  it('Should handle async resolved tuple [null, APIError]', async () => {
    const apiError = new APIError({
      message: 'async error',
      reason: APIErrorReason.NOT_AUTHORIZED,
    });

    (callHandler.handle as jest.Mock).mockReturnValue(
      of(Promise.resolve([null, apiError])),
    );

    await expect(
      interceptor.intercept(executionContext, callHandler).toPromise(),
    ).rejects.toThrow(HttpException);
  });
});
