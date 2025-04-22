import { Expose } from 'class-transformer';
import TestUtilDataFactory from '../../../../test_utils/data/TestUtilsDataFactory';
import { AddSortQueryInterceptor } from '../../../../../common/interceptor/request/addSortQuery.interceptor';

describe('AddSortQueryInterceptor class test suite', () => {
  it('Should set a mongoSort with incrementing order to request if sort query is added', async () => {
    const { context, nextFn, mockRequest } = createRequest({ sort: 'name' });

    const interceptor = new AddSortQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoSort']).toEqual({ name: 1 });
  });

  it('Should set a mongoSort with decreasing order to request if desc query is provided', async () => {
    const { context, nextFn, mockRequest } = createRequest({
      sort: 'name',
      desc: '',
    });

    const interceptor = new AddSortQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoSort']).toEqual({ name: -1 });
  });

  it('Should set a mongoSort with decreasing order to request if desc query is equal to true', async () => {
    const { context, nextFn, mockRequest } = createRequest({
      sort: 'name',
      desc: 'true',
    });

    const interceptor = new AddSortQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoSort']).toEqual({ name: -1 });
  });

  it('Should not set the mongoSort if sorting field is not decorated with @Expose()', async () => {
    const { context, nextFn, mockRequest } = createRequest({ sort: 'salary' });

    const interceptor = new AddSortQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoSort']).toBeUndefined();
  });

  it('Should not set the mongoSort if sort query is not defined', async () => {
    const { context, nextFn, mockRequest } = createRequest();

    const interceptor = new AddSortQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoSort']).toBeUndefined();
  });
});

/**
 * Creates necessary objects for testing AddSortQueryInterceptor
 * @param queryToSet query to set to the request
 * @returns
 */
function createRequest(queryToSet: any = {}) {
  const requestBuilder = TestUtilDataFactory.getBuilder('Request');
  const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
  const handlerBuilder = TestUtilDataFactory.getBuilder('CallHandler');

  const mockRequest = requestBuilder.setQuery(queryToSet).build();

  const context = contextBuilder.setHttpRequest(mockRequest).build();
  const nextFn = handlerBuilder.build();

  return {
    mockRequest,
    context,
    nextFn,
  };
}

/**
 * Dummy object for testing AddSortQueryInterceptor behavior
 */
class MockDtoClass {
  @Expose()
  name: string;

  @Expose()
  age: number;

  @Expose()
  size: number;

  salary: number;
}
