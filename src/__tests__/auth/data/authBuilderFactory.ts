import UserBuilder from './auth/User';
import SignInDtoBuilder from './auth/SignInDtoBuilder';
import SessionBuilder from './auth/SessionBuilder';

type BuilderName = 
  |'SignInDto' 
  | 'User'
  | 'Session';

type BuilderMap = {
  SignInDto: SignInDtoBuilder;
  User: UserBuilder;
  Session: SessionBuilder;
};

export default class AuthBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'SignInDto':
        return new SignInDtoBuilder() as BuilderMap[T];
      case 'User':
        return new UserBuilder() as BuilderMap[T];
      case 'Session':
        return new SessionBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
