import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { StallService } from './stall.service';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { ModelName } from '../../common/enum/modelName.enum';
import { _idDto } from '../../common/dto/_id.dto';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import { StallResponse } from './dto/stallResponse.dto';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { User } from '../../auth/user';
import HasClanRights from '../../clan/role/decorator/guard/HasClanRights';
import { ClanBasicRight } from '../../clan/role/enum/clanBasicRight.enum';
import { BuyStallSlotDto } from './dto/buyStallSlot.dto';
import { AdPosterDto } from './dto/adPoster.dto';

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
  @OffsetPaginate(ModelName.STALL)
  @UniformResponse(ModelName.STALL, StallResponse)
  async getAll() {
    return await this.service.readAll();
  }

  /**
   * Buy additional stall slots
   *
   * @remarks Buy additional stall slots
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 404],
  })
  @Post('/buy-slot')
  @UniformResponse()
  @HasClanRights([ClanBasicRight.SHOP])
  async buyStallSlot(@LoggedUser() user: User, @Body() body: BuyStallSlotDto) {
    const [, error] = await this.service.buyStallSlot(
      user.clan_id,
      body.amount,
    );
    if (error) return [null, error];
  }

  /**
   * Update ad poster for the stall
   *
   * @remarks Update ad poster for the stall
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 404],
  })
  @Patch('/adPoster')
  @UniformResponse()
  @HasClanRights([ClanBasicRight.SHOP])
  async updateAdPoster(@LoggedUser() user: User, @Body() body: AdPosterDto) {
    const [, error] = await this.service.updateAdPosterById(user.clan_id, body);
    if (error) return [null, error];
  }
}
