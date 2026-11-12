import { AddSearchQueryInterceptor } from '../../../common/interceptor/request/addSearchQuery.interceptor';
import { AddSortQueryInterceptor } from '../../../common/interceptor/request/addSortQuery.interceptor';
import { ClanListDto } from '../../../clan/dto/clanList.dto';
import TestUtilDataFactory from '../../test_utils/data/TestUtilsDataFactory';

describe('GET /clan query field restrictions', () => {
  it('allows searching with a clan list field', () => {
    const { context, nextFn, request } = createRequest({
      search: 'name="Warriors"',
    });

    new AddSearchQueryInterceptor(ClanListDto).intercept(context, nextFn);

    expect(request['mongoFilter']).toEqual({
      $and: [{ name: { $eq: 'Warriors' } }],
    });
  });

  it('allows searching with ageRange', () => {
    const { context, nextFn, request } = createRequest({
      search: 'ageRange="Adults"',
    });

    new AddSearchQueryInterceptor(ClanListDto).intercept(context, nextFn);

    expect(request['mongoFilter']).toEqual({
      $and: [{ ageRange: { $eq: 'Adults' } }],
    });
  });

  it('rejects searching with a field outside the clan list', () => {
    const { context, nextFn, request } = createRequest({
      search: 'roles="Leader"',
    });

    new AddSearchQueryInterceptor(ClanListDto).intercept(context, nextFn);

    expect(request['mongoFilter']).toBeUndefined();
  });

  it('allows sorting with a clan list field', () => {
    const { context, nextFn, request } = createRequest({
      sort: 'playerCount',
    });

    new AddSortQueryInterceptor(ClanListDto).intercept(context, nextFn);

    expect(request['mongoSort']).toEqual({ playerCount: 1 });
  });

  it('allows sorting with ageRange', () => {
    const { context, nextFn, request } = createRequest({ sort: 'ageRange' });

    new AddSortQueryInterceptor(ClanListDto).intercept(context, nextFn);

    expect(request['mongoSort']).toEqual({ ageRange: 1 });
  });

  it('rejects sorting with a field outside the clan list', () => {
    const { context, nextFn, request } = createRequest({ sort: 'roles' });

    new AddSortQueryInterceptor(ClanListDto).intercept(context, nextFn);

    expect(request['mongoSort']).toBeUndefined();
  });
});

function createRequest(query: Record<string, string>) {
  const request = TestUtilDataFactory.getBuilder('Request')
    .setQuery(query)
    .build();
  const context = TestUtilDataFactory.getBuilder('ExecutionContext')
    .setHttpRequest(request)
    .build();
  const nextFn = TestUtilDataFactory.getBuilder('CallHandler').build();

  return { context, nextFn, request };
}
