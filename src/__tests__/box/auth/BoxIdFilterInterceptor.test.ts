import { BoxIdFilterInterceptor } from '../../../../src/box/auth/BoxIdFilter.interceptor';
import { CallHandler } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import RequestBuilder from '../../test_utils/data/RequestBuilder';
import ExecutionContextBuilder from '../../test_utils/data/ExecutionContextBuilder';

const mockJwtService = {
  verifyAsync: jest.fn(),
};
const mockReflector = {
  getAllAndOverride: jest.fn(),
};

describe('BoxIdFilterInterceptor class test suite', () => {
  let interceptor: BoxIdFilterInterceptor;
  let callHandler: CallHandler;

  beforeEach(() => {
    interceptor = new BoxIdFilterInterceptor(
      mockReflector as any,
      mockJwtService as any,
    );
    callHandler = { handle: jest.fn() } as any;
    jest.clearAllMocks();
  });

  it('should filter array data by box_id', async () => {
    const boxId = 'box123';
    const data = [
      { box_id: 'box123', value: 1 },
      { box_id: 'box999', value: 2 },
    ];
    const request = new RequestBuilder().build();
    (request as any).user = { box_id: boxId };
    const context = new ExecutionContextBuilder()
      .setHttpRequest(request)
      .build();
    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    const results$ = await interceptor.intercept(context, callHandler);
    const result = await lastValueFrom(results$);
    expect(result).toEqual([{ box_id: 'box123', value: 1 }]);
  });

  it('should filter nested data and update metaData', async () => {
    const boxId = 'box123';
    const data = {
      data: {
        Clan: [
          { box_id: 'box123', name: 'A' },
          { box_id: 'box999', name: 'B' },
        ],
      },
      metaData: { dataKey: 'Clan', dataCount: 2 },
      paginationData: { itemCount: 2 },
    };
    const request = new RequestBuilder().build();
    (request as any).user = { box_id: boxId };
    const context = new ExecutionContextBuilder()
      .setHttpRequest(request)
      .build();
    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    const results$ = await interceptor.intercept(context, callHandler);
    const result = await lastValueFrom(results$);
    expect(result.data.Clan).toEqual([{ box_id: 'box123', name: 'A' }]);
    expect(result.metaData.dataCount).toBe(1);
    expect(result.paginationData.itemCount).toBe(1);
  });

  it('should skip filtering if NO_BOX_ID_FILTER is set', async () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce(true);
    const data = [
      { box_id: 'box123', value: 1 },
      { box_id: 'box999', value: 2 },
    ];
    const request = new RequestBuilder().build();
    (request as any).user = { box_id: 'box123' };
    const context = new ExecutionContextBuilder()
      .setHttpRequest(request)
      .build();
    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    const results$ = await interceptor.intercept(context, callHandler);
    const result = await lastValueFrom(results$);
    expect(result).toEqual(data);
  });

  it('should attach user to request if missing by extracting from JWT', async () => {
    const mockJwtService = {
      verify: jest.fn().mockReturnValue({ box_id: 'test-box-id' }),
    };
    const mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    const interceptor = new BoxIdFilterInterceptor(
      mockReflector as any,
      mockJwtService as any,
    );

    const mockRequest: any = {
      headers: { authorization: 'Bearer test-token' },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const next = {
      handle: () => of({ data: [] }),
    };

    await interceptor.intercept(context, next);

    expect(mockJwtService.verify).toHaveBeenCalledWith('test-token');
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.box_id).toBe('test-box-id');
  });

  it('should throw APIError if JWT is invalid', async () => {
    mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('bad token'));
    const request = new RequestBuilder()
      .setHeaders({ authorization: 'Bearer valid-test-token' })
      .build();
    const context = new ExecutionContextBuilder()
      .setHttpRequest(request)
      .build();
    (callHandler.handle as jest.Mock).mockReturnValue(of([]));

    await expect(
      interceptor.intercept(context, callHandler).then(lastValueFrom),
    ).rejects.toThrow();
  });
});
