import SessionBuilder from './session/SessionBuilder';

type BuilderName = 'Session';

type BuilderMap = {
  Session: SessionBuilder;
};

export default class SessionBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'Session':
        return new SessionBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
