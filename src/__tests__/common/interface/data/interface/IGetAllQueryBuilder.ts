import { IGetAllQuery } from '../../../../../common/interface/IGetAllQuery';

export default class IGetAllQueryBuilder {
  private readonly base: Partial<IGetAllQuery> = {
    filter: {},
    select: [],
    limit: 0,
    sort: {},
    skip: 0,
  };

  build(): IGetAllQuery {
    return { ...this.base } as IGetAllQuery;
  }

  setFilter(filter: object) {
    this.base.filter = filter;
    return this;
  }

  setSelect(select: string[]) {
    this.base.select = select;
    return this;
  }

  setLimit(limit: number) {
    this.base.limit = limit;
    return this;
  }

  setSort(sort: Record<string, 1 | -1>) {
    this.base.sort = sort;
    return this;
  }

  setSkip(skip: number) {
    this.base.skip = skip;
    return this;
  }
}
