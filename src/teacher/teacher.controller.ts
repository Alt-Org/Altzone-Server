import { Controller, Inject, Post, Body } from '@nestjs/common';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { NoBoxIdFilter } from '../box/auth/decorator/NoBoxIdFilter.decorator';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { TeacherService } from './teacher.service';
import { RegisterDto } from './dto/register.dto';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { RegisterResponseDto } from './dto/register-response.dto';

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
      type: RegisterResponseDto,
    },
    hasAuth: false,
    errors: [400],
  })
  @NoBoxIdFilter()
  @UniformResponse(null, RegisterResponseDto)
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.service.register(body);
  }
}
