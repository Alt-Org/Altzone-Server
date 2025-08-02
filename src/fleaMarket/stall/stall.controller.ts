import { Controller, Get, Param } from '@nestjs/common';
import { StallService } from './stall.service';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { ModelName } from '../../common/enum/modelName.enum';
import { _idDto } from '../../common/dto/_id.dto';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import { StallResponse } from './payloads/stallResponse';
import SwaggerTags from 'src/common/swagger/tags/SwaggerTags.decorator';

@Controller('stall')
export class StallController {
  constructor(private readonly service: StallService) {}

  /**
   * Get a single stall by clan ID
   */
  @ApiResponseDescription({
    success: {
      status: 200,
    },
    errors: [400, 401, 403, 404],
  })
  @Get('/:_id')
  @SwaggerTags('Release on 27.07.2025', 'Stall')
  @UniformResponse(ModelName.STALL, StallResponse)
  async getOne(@Param() param: _idDto) {
    return await this.service.readOneByClanId(param._id);
  }

  /**
   * Get all stall items
   */
  @ApiResponseDescription({
    success: {
      status: 200,
    },
    errors: [400, 401, 403, 404],
  })
  @Get()
  @SwaggerTags('Release on 27.07.2025', 'Stall')
  @OffsetPaginate(ModelName.STALL)
  @UniformResponse(ModelName.STALL, StallResponse)
  async getAll() {
    return await this.service.readManyStalls();
  }
}
