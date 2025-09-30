import { Controller, Inject, Post, Body, HttpCode } from '@nestjs/common';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { NoBoxIdFilter } from '../box/auth/decorator/NoBoxIdFilter.decorator';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { TeacherService } from './teacher.service';
import { CredentialsDto } from './dto/credentials.dto';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { AccessTokenDto } from './dto/access-token.dto';
import { ModelName } from '../common/enum/modelName.enum';

@NoAuth()
@Controller('teacher')
export class TeacherController {
  constructor(
    @Inject(TeacherService) private readonly service: TeacherService,
  ) {}

  /**
   * Register teacher profile
   *
   * @remarks If the registration is successful you get you JWT Auth token
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      type: AccessTokenDto,
    },
    hasAuth: false,
    errors: [400],
  })
  @NoBoxIdFilter()
  @UniformResponse(null, AccessTokenDto)
  @Post('register')
  async register(@Body() body: CredentialsDto) {
    const { username, password } = body;
    return await this.service.register(username, password);
  }

  /**
   * Login with teacher profile
   */
  @ApiResponseDescription({
    success: {
      status: 200,
      type: AccessTokenDto,
    },
    errors: [400, 404],
  })
  @HttpCode(200)
  @NoBoxIdFilter()
  @UniformResponse(null, AccessTokenDto)
  @Post('login')
  async login(@Body() body: CredentialsDto) {
    const { username, password } = body;
    return await this.service.login(username, password);
  }
}
