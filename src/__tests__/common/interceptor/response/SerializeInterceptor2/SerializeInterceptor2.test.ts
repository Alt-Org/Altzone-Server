import { Expose } from 'class-transformer';
import TestUtilDataFactory from '../../../../test_utils/data/TestUtilsDataFactory';
import { SerializeInterceptor2 } from '../../../../../common/interceptor/response/SerializeInterceptor2';

describe('SerializeInterceptor2 class test suite', () => {
  const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
  const handlerBuilder = TestUtilDataFactory.getBuilder('CallHandler');
  const context = contextBuilder.build();
  let interceptor: SerializeInterceptor2;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new SerializeInterceptor2(MockDtoClass);
  });

  it('Should serialize the object returned as IServiceResponse tuple and exclude fields not decorated with @Expose()', async () => {
    const name = 'Alice';

    const data = new MockDtoClass(name, 5000);
    const mockResp = [data, null];
    const expected = [{ name }, null];

    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toEqual(expected);
    });
  });

  it('Should serialize the array returned as IServiceResponse tuple and exclude fields not decorated with @Expose()', async () => {
    const name1 = 'Alice';
    const name2 = 'Bob';

    const data = [new MockDtoClass(name1, 5000), new MockDtoClass(name2, 3000)];
    const mockResp = [data, null];
    const expected = [[{ name: name1 }, { name: name2 }], null];

    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toEqual(expected);
    });
  });

  it('Should serialize the data returned as object and exclude fields not decorated with @Expose()', async () => {
    const name = 'Alice';

    const mockResp = new MockDtoClass(name, 5000);
    const expected = [{ name }, null];

    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toEqual(expected);
    });
  });

  it('Should serialize the data returned as array and exclude fields not decorated with @Expose()', async () => {
    const name1 = 'Alice';
    const name2 = 'Bob';

    const mockResp = [
      new MockDtoClass(name1, 5000),
      new MockDtoClass(name2, 3000),
    ];
    const expected = [[{ name: name1 }, { name: name2 }], null];

    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toEqual(expected);
    });
  });

  it('Should return response as-is when no DTO shape is provided', async () => {
    interceptor = new SerializeInterceptor2();
    const mockResp = [new MockDtoClass('Alice', 999), null];

    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toEqual(mockResp);
    });
  });

  it('Should return IServiceResponse tuple as-is when error exists', async () => {
    const errorTuple = [null, { message: 'Something went wrong' }];
    const nextFn = handlerBuilder.setHandleResponse(errorTuple).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toEqual(errorTuple);
    });
  });

  it('Should return undefined as-is when response is undefined', async () => {
    const mockResp = undefined;
    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData).toBeUndefined();
    });
  });
});

/**
 * Dummy class used for testing the serialization
 */
class MockDtoClass {
  constructor(name: string, salary: number) {
    this.name = name;
    this.salary = salary;
  }

  @Expose()
  name: string;

  salary: number;
}
