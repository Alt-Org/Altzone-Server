import { AddSearchQueryInterceptor } from '../../../../../common/interceptor/request/addSearchQuery.interceptor';
import { Expose } from 'class-transformer';
import TestUtilDataFactory from '../../../../test_utils/data/TestUtilsDataFactory';

describe('AddSearchQueryInterceptor class test suite', () => {
  it('Should set a valid mongoFilter to request with query containing "AND"', async () => {
    const { context, nextFn, mockRequest } = createRequest({
      search: 'name="John";AND;age>=30',
    });

    const interceptor = new AddSearchQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoFilter']).toEqual({
      $and: expect.arrayContaining([
        { age: { $gte: 30 } },
        { name: { $eq: 'John' } },
      ]),
    });
  });

  it('Should ignore fields not decorated with @Expose()', async () => {
    const { context, nextFn, mockRequest } = createRequest({
      search: 'name="John";AND;salary>=30',
    });

    const interceptor = new AddSearchQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoFilter']).toEqual({
      $and: expect.arrayContaining([{ name: { $eq: 'John' } }]),
    });
  });

  it('Should set a valid mongoFilter to request with query containing "OR"', async () => {
    const { context, nextFn, mockRequest } = createRequest({
      search: 'name="John";OR;age>=30',
    });

    const interceptor = new AddSearchQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoFilter']).toEqual({
      $or: expect.arrayContaining([
        { $and: [{ name: { $eq: 'John' } }] },
        { $and: [{ age: { $gte: 30 } }] },
      ]),
    });
  });

  it('Should set a valid mongoFilter to request with query containing "OR" and "AND"', async () => {
    const { context, nextFn, mockRequest } = createRequest({
      search: 'name="John";OR;age>=30;AND;size=20',
    });

    const interceptor = new AddSearchQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoFilter']).toEqual({
      $or: expect.arrayContaining([
        { $and: [{ name: { $eq: 'John' } }] },
        {
          $and: expect.arrayContaining([
            { age: { $gte: 30 } },
            { size: { $eq: 20 } },
          ]),
        },
      ]),
    });
  });

  it('Should not add mongoFilter to request if search query is not defined', async () => {
    const { context, nextFn, mockRequest } = createRequest();

    const interceptor = new AddSearchQueryInterceptor(MockDtoClass);
    interceptor.intercept(context, nextFn);

    expect(mockRequest['mongoFilter']).toBeUndefined();
  });
});

/**
 * Creates necessary objects for testing AddSearchQueryInterceptor
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
 * Dummy object for testing AddSearchQueryInterceptor behavior
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
