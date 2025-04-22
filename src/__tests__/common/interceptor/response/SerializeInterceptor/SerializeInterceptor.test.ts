import { Expose } from 'class-transformer';
import TestUtilDataFactory from '../../../../test_utils/data/TestUtilsDataFactory';
import { SerializeInterceptor } from '../../../../../common/interceptor/response/Serialize';

describe('SerializeInterceptor class test suite', () => {
  const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
  const handlerBuilder = TestUtilDataFactory.getBuilder('CallHandler');
  const context = contextBuilder.build();
  let interceptor: SerializeInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new SerializeInterceptor(MockDtoClass);
  });

  it('Should return exclude fields that are not decorated with @Expose()', async () => {
    const data = new MockDtoClass('John', 23);
    const dataKey = 'MockDtoClass';
    const mockResp = {
      data: { [dataKey]: data },
      metaData: { dataKey },
    };
    const expected = { name: 'John' };

    const nextFn = handlerBuilder.setHandleResponse(mockResp).build();

    const result = await interceptor.intercept(context, nextFn);

    result.subscribe(async (returnedData) => {
      const awaitedData = await returnedData;
      expect(awaitedData['data'][dataKey]).toEqual(expected);
    });
  });

  it('Should return undefined as it is if the response is empty', async () => {
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
 * Dummy object for testing AddSortQueryInterceptor behavior
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
