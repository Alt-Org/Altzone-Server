import { Body, Controller, Inject, Post } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { ThrowAuthErrorIfFound } from './decorator/ThrowAuthErrorIfFound.decorator';
import { NoAuth } from './decorator/NoAuth.decorator';
import { AUTH_SERVICE } from './constant';
import BoxAuthService from './box/BoxAuthService';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { ModelName } from '../common/enum/modelName.enum';
import { ProfileDto } from '../profile/dto/profile.dto';

@NoAuth()
@Controller('auth')
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthService | BoxAuthService,
  ) {}

  /**
   * Log in to the system.
   *
   * @remarks After the profile with player was created, the user can log in to the system and get a JWT token to access resources.
   *
   * If the user provides the correct credentials, the access token will be returned, which should be used as a Bearer token in the Authorization header.
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      modelName: ModelName.CLAN,
      type: ProfileDto,
    },
    errors: [400, 401],
  })
  @Post('/signIn')
  @ThrowAuthErrorIfFound()
  public signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body.username, body.password);
  }
}
