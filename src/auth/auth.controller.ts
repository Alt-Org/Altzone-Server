import { Body, Controller, Inject, Post } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { ThrowAuthErrorIfFound } from './decorator/ThrowAuthErrorIfFound.decorator';
import { NoAuth } from './decorator/NoAuth.decorator';
import { AUTH_SERVICE } from './constant';
import BoxAuthService from './box/BoxAuthService';

@NoAuth()
@Controller('auth')
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthService | BoxAuthService,
  ) {}

  @Post('/signIn')
  @ThrowAuthErrorIfFound()
  public signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body.username, body.password);
  }
}
