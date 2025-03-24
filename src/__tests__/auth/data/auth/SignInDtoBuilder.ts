import { SignInDto } from '../../../../auth/dto/signIn.dto';

export default class SignInDtoBuilder {
  private readonly base: Partial<SignInDto> = {
    username: 'defaultUsername',
    password: 'defaultPassword',
  };

  build(): SignInDto {
    return { ...this.base } as SignInDto;
  }

  setUsername(username: string) {
    this.base.username = username;
    return this;
  }

  setPassword(password: string) {
    this.base.password = password;
    return this;
  }
}
