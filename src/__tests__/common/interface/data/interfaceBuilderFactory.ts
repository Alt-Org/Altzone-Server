import IGetAllQueryBuilder from './interface/IGetAllQueryBuilder';

type BuilderName = 'IGetAllQuery';

type BuilderMap = {
  IGetAllQuery: IGetAllQueryBuilder;
};

export default class InterfaceBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'IGetAllQuery':
        return new IGetAllQueryBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
