import UserBuilder from './auth/User';
import SignInDtoBuilder from './auth/SignInDtoBuilder';

type BuilderName = 'SignInDto' | 'User';

type BuilderMap = {
  SignInDto: SignInDtoBuilder;
  User: UserBuilder;
};

export default class AuthBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'SignInDto':
        return new SignInDtoBuilder() as BuilderMap[T];
      case 'User':
        return new UserBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
